import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types';
import { PostsService } from './posts.service';
import type { PostDto } from './posts.types';

/**
 * Posts CRUD endpoints for authenticated users.
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Returns posts for current user.
   */
  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ posts: PostDto[] }> {
    const posts = await this.postsService.listForUser(request.authUser!.id);
    return { posts };
  }

  /**
   * Creates new post.
   */
  @HttpPost()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.createForUser(
      request.authUser!.id,
      body,
    );
    return { post };
  }

  /**
   * Returns one post by id.
   */
  @Get(':id')
  async getById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.getByIdForUser(
      id,
      request.authUser!.id,
    );
    return { post };
  }

  /**
   * Updates one post by id.
   */
  @Patch(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.updateForUser(
      id,
      request.authUser!.id,
      body,
    );
    return { post };
  }

  /**
   * Deletes one post by id.
   */
  @Delete(':id')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ success: true }> {
    await this.postsService.removeForUser(id, request.authUser!.id);
    return { success: true };
  }

  /**
   * Publishes post to connected Telegram channel.
   */
  @HttpPost(':id/publish')
  async publish(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.publishForUser(
      id,
      request.authUser!.id,
    );
    return { post };
  }
}
