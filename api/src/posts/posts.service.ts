import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Post } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import {
  createPostSchema,
  type CreatePostInput,
  updatePostSchema,
  type UpdatePostInput,
} from './posts.schemas';
import type { PostDto } from './posts.types';

type PostSelectResult = Pick<
  Post,
  | 'id'
  | 'userId'
  | 'channelId'
  | 'title'
  | 'body'
  | 'status'
  | 'telegramMessageId'
  | 'publishedAt'
  | 'errorMessage'
  | 'createdAt'
  | 'updatedAt'
> & {
  channel: {
    telegramUsername: string | null;
  } | null;
};

/**
 * Handles posts CRUD operations for authenticated users.
 */
@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Returns current user's posts ordered by newest first.
   */
  async listForUser(userId: string): Promise<PostDto[]> {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: this.postSelect(),
    });

    return posts.map((post) => this.toDto(post));
  }

  /**
   * Creates new post draft for current user.
   */
  async createForUser(userId: string, payload: unknown): Promise<PostDto> {
    const input = this.parseCreateInput(payload);

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
    const hasContentUpdate = input.title !== undefined || input.body !== undefined;
    await this.findOwnedPostOrThrow(postId, userId);

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(input.title !== undefined
          ? { title: this.normalizeTitle(input.title) }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(hasContentUpdate
          ? {
              status: 'draft',
              telegramMessageId: null,
              publishedAt: null,
              errorMessage: null,
            }
          : {}),
      },
      select: this.postSelect(),
    });

    return this.toDto(post);
  }

  /**
   * Deletes post owned by current user.
   */
  async removeForUser(postId: string, userId: string): Promise<void> {
    await this.findOwnedPostOrThrow(postId, userId);
    await this.prisma.post.delete({ where: { id: postId } });
  }

  /**
   * Sends post body to user's connected Telegram channel.
   */
  async publishForUser(postId: string, userId: string): Promise<PostDto> {
    const post = await this.findOwnedPostOrThrow(postId, userId);

    if (post.status === 'published' && post.telegramMessageId !== null) {
      return this.toDto(post);
    }

    const channel = await this.prisma.channel.findUnique({
      where: { userId },
      select: {
        id: true,
        telegramChatId: true,
        telegramUsername: true,
      },
    });

    if (!channel) {
      throw new BadRequestException('Connect channel first');
    }

    try {
      const sentMessage = await this.telegramService.sendMessage(
        channel.telegramChatId,
        post.body,
      );

      const publishedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'published',
          channelId: channel.id,
          telegramMessageId: sentMessage.message_id,
          publishedAt: new Date(),
          errorMessage: null,
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

  private parseCreateInput(payload: unknown): CreatePostInput {
    const parsed = createPostSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid body',
      );
    }
    return parsed.data;
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
      telegramMessageId: true,
      publishedAt: true,
      errorMessage: true,
      createdAt: true,
      updatedAt: true,
      channel: {
        select: {
          telegramUsername: true,
        },
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
      telegramMessageId: post.telegramMessageId,
      publishedAt: post.publishedAt?.toISOString() ?? null,
      errorMessage: post.errorMessage,
      telegramPostUrl: this.buildTelegramPostUrl(
        post.channel?.telegramUsername ?? null,
        post.telegramMessageId,
      ),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
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
