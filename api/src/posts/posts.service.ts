import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BotConnectionsService } from '../bot-connections/bot-connections.service';
import type { Post } from '../generated/prisma/client';
import {
  MEDIA_STORAGE,
  type MediaStorage,
} from '../media/media-storage.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from '../queue/schedule.service';
import { TelegramService, type MediaItem } from '../telegram/telegram.service';
import type { TelegramMediaGroupMessage } from '../telegram/telegram.types';
import {
  calendarPostsQuerySchema,
  createPostSchema,
  type CalendarPostsQuery,
  type CreatePostInput,
  listPostsQuerySchema,
  type ListPostsQuery,
  publishPostSchema,
  type PublishPostInput,
  updatePostSchema,
  type UpdatePostInput,
} from './posts.schemas';
import type { PostDto, PostMediaDto } from './posts.types';

const MAX_MEDIA_FILES = 10;

type PostMediaSelectResult = {
  id: string;
  mediaType: 'photo' | 'video';
  telegramFileId: string | null;
  storageKey: string | null;
  originalName: string | null;
  mimeType: string | null;
  order: number;
};

type PostSelectResult = Pick<
  Post,
  | 'id'
  | 'userId'
  | 'channelId'
  | 'title'
  | 'body'
  | 'status'
  | 'scheduledAt'
  | 'telegramMessageId'
  | 'publishedAt'
  | 'errorMessage'
  | 'createdAt'
  | 'updatedAt'
> & {
  channel: { title: string | null; telegramUsername: string | null } | null;
  mediaItems: PostMediaSelectResult[];
};

/**
 * Handles posts CRUD operations for authenticated users.
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
    private readonly botConnectionsService: BotConnectionsService,
    private readonly scheduleService: ScheduleService,
    @Inject(MEDIA_STORAGE) private readonly mediaStorage: MediaStorage,
  ) {}

  /**
   * Returns paginated posts for current user with optional status filter.
   */
  async listForUser(
    userId: string,
    query: ListPostsQuery,
  ): Promise<{ posts: PostDto[]; total: number; hasMore: boolean }> {
    const { page, limit, status } = query;
    const where = { userId, ...(status ? { status } : {}) };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: this.postSelect(),
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts: posts.map((post) => this.toDto(post)),
      total,
      hasMore: page * limit < total,
    };
  }

  /**
   * Returns posts visible on calendar within inclusive date range.
   */
  async listForCalendar(
    userId: string,
    query: CalendarPostsQuery,
  ): Promise<PostDto[]> {
    const parsed = calendarPostsQuerySchema.parse(query);
    const fromDate = this.parseDateOnly(parsed.from);
    const toDate = this.parseDateOnly(parsed.to);
    toDate.setHours(23, 59, 59, 999);

    if (fromDate > toDate) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        OR: [
          {
            status: 'scheduled',
            scheduledAt: { gte: fromDate, lte: toDate },
          },
          {
            status: 'published',
            publishedAt: { gte: fromDate, lte: toDate },
          },
        ],
      },
      select: this.postSelect(),
    });

    return posts
      .map((post) => this.toDto(post))
      .sort(
        (left, right) =>
          this.getCalendarEventTime(left).getTime() -
          this.getCalendarEventTime(right).getTime(),
      );
  }

  /**
   * Creates new post draft or scheduled post for current user.
   */
  async createForUser(userId: string, payload: unknown): Promise<PostDto> {
    const input = this.parseCreateInput(payload);

    if (input.scheduledAt) {
      const scheduledAt = this.scheduleService.parseScheduledAt(input.scheduledAt);
      const channel = await this.scheduleService.resolveChannelForSchedule(
        userId,
        input.channelId!,
      );

      const post = await this.prisma.post.create({
        data: {
          userId,
          title: this.normalizeTitle(input.title),
          body: input.body,
          status: 'scheduled',
          scheduledAt,
          channelId: channel.id,
        },
        select: this.postSelect(),
      });

      await this.scheduleService.enqueueScheduledPost(
        post.id,
        userId,
        scheduledAt,
      );

      return this.toDto(post);
    }

    const post = await this.prisma.post.create({
      data: {
        userId,
        title: this.normalizeTitle(input.title),
        body: input.body,
        status: 'draft',
      },
      select: this.postSelect(),
    });

    return this.toDto(post);
  }

  /**
   * Returns single post owned by current user.
   */
  async getByIdForUser(postId: string, userId: string): Promise<PostDto> {
    const post = await this.findOwnedPostOrThrow(postId, userId);
    return this.toDto(post);
  }

  /**
   * Updates post owned by current user.
   */
  async updateForUser(
    postId: string,
    userId: string,
    payload: unknown,
  ): Promise<PostDto> {
    const input = this.parseUpdateInput(payload);
    const existing = await this.findOwnedPostOrThrow(postId, userId);
    const hasContentUpdate =
      input.title !== undefined || input.body !== undefined;
    const hasScheduleUpdate =
      input.scheduledAt !== undefined || input.channelId !== undefined;

    if (existing.status === 'published' && (hasContentUpdate || hasScheduleUpdate)) {
      throw new BadRequestException('Published posts cannot be rescheduled');
    }

    if (hasContentUpdate && existing.status === 'scheduled') {
      await this.scheduleService.cancelScheduledPost(postId);
    }

    let nextScheduledAt: Date | null | undefined = undefined;
    let nextStatus = existing.status;
    let nextChannelId: string | undefined = undefined;

    if (input.scheduledAt === null) {
      await this.scheduleService.cancelScheduledPost(postId);
      nextScheduledAt = null;
      nextStatus = hasContentUpdate ? 'draft' : existing.status === 'scheduled' ? 'draft' : existing.status;
    } else if (input.scheduledAt !== undefined) {
      const scheduledAt = this.scheduleService.parseScheduledAt(input.scheduledAt);
      const channelId = input.channelId ?? existing.channelId;
      if (!channelId) {
        throw new BadRequestException('channelId is required when scheduling a post');
      }
      await this.scheduleService.resolveChannelForSchedule(userId, channelId);
      nextScheduledAt = scheduledAt;
      nextChannelId = channelId;
      nextStatus = 'scheduled';
    } else if (input.channelId !== undefined && existing.status === 'scheduled') {
      await this.scheduleService.resolveChannelForSchedule(userId, input.channelId);
      nextChannelId = input.channelId;
    }

    if (hasContentUpdate) {
      nextStatus = input.scheduledAt === undefined && existing.status === 'scheduled'
        ? 'draft'
        : nextStatus === 'scheduled'
          ? 'scheduled'
          : 'draft';
      if (nextStatus === 'draft') {
        nextScheduledAt = null;
      }
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(input.title !== undefined
          ? { title: this.normalizeTitle(input.title) }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(nextChannelId !== undefined ? { channelId: nextChannelId } : {}),
        ...(nextScheduledAt !== undefined ? { scheduledAt: nextScheduledAt } : {}),
        ...(hasContentUpdate && nextStatus === 'draft'
          ? {
              status: 'draft',
              telegramMessageId: null,
              publishedAt: null,
              errorMessage: null,
              scheduledAt: null,
            }
          : {}),
        ...(nextStatus === 'scheduled' ? { status: 'scheduled', errorMessage: null } : {}),
      },
      select: this.postSelect(),
    });

    if (post.status === 'scheduled' && post.scheduledAt) {
      await this.scheduleService.enqueueScheduledPost(
        post.id,
        userId,
        post.scheduledAt,
      );
    }

    return this.toDto(post);
  }

  /**
   * Deletes post owned by current user.
   */
  async removeForUser(postId: string, userId: string): Promise<void> {
    const post = await this.findOwnedPostOrThrow(postId, userId);
    if (post.status === 'scheduled') {
      await this.scheduleService.cancelScheduledPost(postId);
    }
    await this.cleanupPostMediaStorage(post.mediaItems);
    await this.prisma.post.delete({ where: { id: postId } });
  }

  /**
   * Uploads media files for draft, scheduled, or failed posts.
   */
  async uploadMediaForUser(
    postId: string,
    userId: string,
    files: Express.Multer.File[],
  ): Promise<PostDto> {
    if (files.length === 0) {
      throw new BadRequestException('No media files provided');
    }

    const post = await this.findOwnedPostOrThrow(postId, userId);
    this.assertMediaEditableStatus(post.status);

    if (post.mediaItems.length + files.length > MAX_MEDIA_FILES) {
      throw new BadRequestException(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
    }

    const baseOrder = post.mediaItems.length;

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]!;
      const mediaId = randomUUID();
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'photo';
      const { storageKey } = await this.mediaStorage.save({
        postId,
        mediaId,
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      });

      await this.prisma.postMedia.create({
        data: {
          id: mediaId,
          postId,
          mediaType,
          storageKey,
          originalName: file.originalname,
          sizeBytes: file.size,
          mimeType: file.mimetype,
          order: baseOrder + index,
        },
      });
    }

    return this.getByIdForUser(postId, userId);
  }

  /**
   * Removes pending media file from a post.
   */
  async deleteMediaForUser(
    postId: string,
    userId: string,
    mediaId: string,
  ): Promise<PostDto> {
    const post = await this.findOwnedPostOrThrow(postId, userId);
    this.assertMediaEditableStatus(post.status);

    const mediaItem = post.mediaItems.find((item) => item.id === mediaId);
    if (!mediaItem) {
      throw new NotFoundException('Media not found');
    }

    if (!mediaItem.storageKey) {
      throw new BadRequestException('Published media cannot be removed');
    }

    await this.mediaStorage.delete(mediaItem.storageKey);
    await this.prisma.postMedia.delete({ where: { id: mediaId } });

    return this.getByIdForUser(postId, userId);
  }

  /**
   * Sends post body to user's connected Telegram channel.
   * Supports optional media files — photo/video via sendPhoto/sendVideo/sendMediaGroup.
   */
  async publishForUser(
    postId: string,
    userId: string,
    payload: unknown = {},
    files: Express.Multer.File[] = [],
  ): Promise<PostDto> {
    const input = this.parsePublishInput(payload);
    const post = await this.findOwnedPostOrThrow(postId, userId);

    if (post.status === 'published' && post.telegramMessageId !== null) {
      return this.toDto(post);
    }

    if (post.status === 'scheduled') {
      await this.scheduleService.cancelScheduledPost(postId);
    }

    const botToken =
      await this.botConnectionsService.getRequiredActiveTokenForUser(userId);
    const channel = await this.resolvePublishChannel(
      userId,
      input.channelId ?? post.channelId ?? undefined,
    );

    if (!channel) {
      throw new BadRequestException('Connect channel first');
    }

    try {
      const membership = await this.telegramService.getBotMembership(
        botToken,
        channel.telegramChatId,
      );
      if (
        membership.status !== 'administrator' &&
        membership.status !== 'creator'
      ) {
        throw new BadRequestException('Bot must be admin in the selected channel');
      }

      const mediaItems =
        files.length > 0
          ? this.buildMediaItems(files)
          : await this.loadStoredMediaItems(post.mediaItems);
      const storageKeysToDelete = post.mediaItems
        .map((item) => item.storageKey)
        .filter((key): key is string => Boolean(key));

      let sentMessageId: number;
      let savedMediaItems: {
        telegramFileId: string;
        mediaType: 'photo' | 'video';
        mimeType: string | null;
        order: number;
      }[] = [];

      if (mediaItems.length === 0) {
        const sent = await this.telegramService.sendMessage(
          botToken,
          channel.telegramChatId,
          post.body,
        );
        sentMessageId = sent.message_id;
      } else if (mediaItems.length === 1) {
        const item = mediaItems[0]!;
        if (item.mediaType === 'video') {
          const sent = await this.telegramService.sendVideo(
            botToken,
            channel.telegramChatId,
            item,
            post.body,
          );
          sentMessageId = sent.message_id;
          savedMediaItems = [
            {
              telegramFileId: sent.video.file_id,
              mediaType: 'video',
              mimeType: item.mimeType,
              order: 0,
            },
          ];
        } else {
          const sent = await this.telegramService.sendPhoto(
            botToken,
            channel.telegramChatId,
            item,
            post.body,
          );
          sentMessageId = sent.message_id;
          const bestPhoto = sent.photo.at(-1);
          savedMediaItems = [
            {
              telegramFileId: bestPhoto?.file_id ?? '',
              mediaType: 'photo',
              mimeType: item.mimeType,
              order: 0,
            },
          ];
        }
      } else {
        const sentMessages = await this.telegramService.sendMediaGroup(
          botToken,
          channel.telegramChatId,
          mediaItems,
          post.body,
        );
        sentMessageId = sentMessages[0]!.message_id;
        savedMediaItems = sentMessages.map((message, index) => ({
          telegramFileId: this.extractFileIdFromMessage(
            message,
            mediaItems[index]!.mediaType,
          ),
          mediaType: mediaItems[index]!.mediaType,
          mimeType: mediaItems[index]!.mimeType,
          order: index,
        }));
      }

      if (storageKeysToDelete.length > 0) {
        await this.mediaStorage.deleteMany(storageKeysToDelete);
      }

      const publishedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'published',
          channelId: channel.id,
          telegramMessageId: sentMessageId,
          publishedAt: new Date(),
          errorMessage: null,
          ...(savedMediaItems.length > 0
            ? {
                mediaItems: {
                  deleteMany: {},
                  createMany: {
                    data: savedMediaItems,
                  },
                },
              }
            : {}),
        },
        select: this.postSelect(),
      });

      return this.toDto(publishedPost);
    } catch (error: unknown) {
      const errorMessage = this.normalizePublishError(error);
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'failed',
          channelId: channel.id,
          telegramMessageId: null,
          publishedAt: null,
          errorMessage,
        },
      });
      throw new BadRequestException(errorMessage);
    }
  }

  private getCalendarEventTime(post: PostDto): Date {
    if (post.status === 'scheduled' && post.scheduledAt) {
      return new Date(post.scheduledAt);
    }
    if (post.publishedAt) {
      return new Date(post.publishedAt);
    }
    return new Date(post.createdAt);
  }

  private parseDateOnly(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year!, month! - 1, day);
  }

  /**
   * Converts multer files to typed MediaItem array for TelegramService.
   */
  private buildMediaItems(files: Express.Multer.File[]): MediaItem[] {
    return files.map((file) => ({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      mediaType: file.mimetype.startsWith('video/') ? 'video' : 'photo',
    }));
  }

  private async loadStoredMediaItems(
    mediaItems: PostMediaSelectResult[],
  ): Promise<MediaItem[]> {
    const pendingItems = mediaItems
      .filter((item) => item.storageKey)
      .sort((left, right) => left.order - right.order);

    return Promise.all(
      pendingItems.map(async (item) => {
        const stored = await this.mediaStorage.load(item.storageKey!);
        return {
          buffer: stored.buffer,
          mimeType: item.mimeType ?? stored.mimeType,
          originalName: item.originalName ?? stored.originalName,
          mediaType: item.mediaType,
        };
      }),
    );
  }

  private extractFileIdFromMessage(
    message: TelegramMediaGroupMessage,
    mediaType: 'photo' | 'video',
  ): string {
    if (mediaType === 'video' && message.video) {
      return message.video.file_id;
    }

    return message.photo?.at(-1)?.file_id ?? '';
  }

  private assertMediaEditableStatus(status: Post['status']): void {
    if (status === 'published') {
      throw new BadRequestException('Published posts cannot be modified');
    }
  }

  private async cleanupPostMediaStorage(
    mediaItems: PostMediaSelectResult[],
  ): Promise<void> {
    const storageKeys = mediaItems
      .map((item) => item.storageKey)
      .filter((key): key is string => Boolean(key));

    if (storageKeys.length > 0) {
      await this.mediaStorage.deleteMany(storageKeys);
    }
  }

  private parseCreateInput(payload: unknown): CreatePostInput {
    const parsed = createPostSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
  }

  private parsePublishInput(payload: unknown): PublishPostInput {
    const parsed = publishPostSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid publish payload',
      );
    }
    return parsed.data;
  }

  private async resolvePublishChannel(
    userId: string,
    channelId?: string,
  ): Promise<{
    id: string;
    telegramChatId: string;
    telegramUsername: string | null;
  } | null> {
    const select = {
      id: true,
      telegramChatId: true,
      telegramUsername: true,
    } as const;

    if (channelId) {
      return this.prisma.channel.findFirst({
        where: { id: channelId, userId },
        select,
      });
    }

    return this.prisma.channel.findFirst({
      where: { userId },
      orderBy: { botConnectedAt: 'desc' },
      select,
    });
  }

  private parseUpdateInput(payload: unknown): UpdatePostInput {
    const parsed = updatePostSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
  }

  private normalizeTitle(title: string | undefined): string | null {
    if (title === undefined) {
      return null;
    }
    const normalized = title.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async findOwnedPostOrThrow(
    postId: string,
    userId: string,
  ): Promise<PostSelectResult> {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
      select: this.postSelect(),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private postSelect() {
    return {
      id: true,
      userId: true,
      channelId: true,
      title: true,
      body: true,
      status: true,
      scheduledAt: true,
      telegramMessageId: true,
      publishedAt: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
      channel: {
        select: { title: true, telegramUsername: true },
      },
      mediaItems: {
        select: {
          id: true,
          mediaType: true,
          telegramFileId: true,
          storageKey: true,
          originalName: true,
          mimeType: true,
          order: true,
        },
        orderBy: { order: 'asc' as const },
      },
    };
  }

  private toDto(post: PostSelectResult): PostDto {
    return {
      id: post.id,
      userId: post.userId,
      channelId: post.channelId,
      title: post.title,
      body: post.body,
      status: post.status,
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      telegramMessageId: post.telegramMessageId,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      errorMessage: post.errorMessage,
      telegramPostUrl: this.buildTelegramPostUrl(
        post.channel?.telegramUsername ?? null,
        post.telegramMessageId,
      ),
      channelLabel: this.buildChannelLabel(post.channel),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      mediaItems: post.mediaItems.map(
        (m): PostMediaDto => ({
          id: m.id,
          mediaType: m.mediaType,
          telegramFileId: m.telegramFileId,
          originalName: m.originalName,
          mimeType: m.mimeType,
          order: m.order,
          isPending: Boolean(m.storageKey),
        }),
      ),
    };
  }

  private buildChannelLabel(
    channel: { title: string | null; telegramUsername: string | null } | null,
  ): string | null {
    if (!channel) {
      return null;
    }
    if (channel.telegramUsername) {
      return channel.telegramUsername.startsWith('@')
        ? channel.telegramUsername
        : `@${channel.telegramUsername}`;
    }
    return channel.title || null;
  }

  private buildTelegramPostUrl(
    telegramUsername: string | null,
    telegramMessageId: number | null,
  ): string | null {
    if (!telegramUsername || telegramMessageId === null) {
      return null;
    }
    const cleanUsername = telegramUsername.replace(/^@/, '');
    if (!cleanUsername) {
      return null;
    }
    return `https://t.me/${cleanUsername}/${telegramMessageId}`;
  }

  private normalizePublishError(error: unknown): string {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const message = (response as { message?: unknown }).message;
        if (typeof message === 'string') {
          return message;
        }
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to publish post in Telegram';
  }
}
