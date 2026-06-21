import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Post } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPostSchema,
  type CreatePostInput,
  updatePostSchema,
  type UpdatePostInput,
} from './posts.schemas';
import type { PostDto } from './posts.types';

type PostSelectResult = Pick<
  Post,
  'id' | 'userId' | 'title' | 'body' | 'status' | 'createdAt' | 'updatedAt'
>;

/**
 * Handles posts CRUD operations for authenticated users.
 */
@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

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
        status: input.status ?? 'draft',
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

    await this.findOwnedPostOrThrow(postId, userId);

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(input.title !== undefined
          ? { title: this.normalizeTitle(input.title) }
          : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
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
      title: true,
      body: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  private toDto(post: PostSelectResult): PostDto {
    return {
      id: post.id,
      userId: post.userId,
      title: post.title,
      body: post.body,
      status: post.status,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
