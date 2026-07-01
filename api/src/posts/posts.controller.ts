import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '../auth/auth.types';
import {
  calendarPostsQuerySchema,
  listPostsQuerySchema,
} from './posts.schemas';
import { PostsService } from './posts.service';
import type { PostDto } from './posts.types';

/**
 * Posts CRUD endpoints for authenticated users.
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Returns paginated posts for current user with optional status filter.
   */
  @Get()
  async list(
    @Req() request: AuthenticatedRequest,
    @Query() rawQuery: unknown,
  ): Promise<{ posts: PostDto[]; total: number; hasMore: boolean }> {
    const parsed = listPostsQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid query params',
      );
    }
    return this.postsService.listForUser(request.authUser!.id, parsed.data);
  }

  /**
   * Returns posts for calendar view within a date range.
   */
  @Get('calendar')
  async calendar(
    @Req() request: AuthenticatedRequest,
    @Query() rawQuery: unknown,
  ): Promise<{ posts: PostDto[] }> {
    const parsed = calendarPostsQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new BadRequestException(
        parsed.error.issues[0]?.message ?? 'Invalid query params',
      );
    }
    const posts = await this.postsService.listForCalendar(
      request.authUser!.id,
      parsed.data,
    );
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
   * Uploads media files for draft, scheduled, or failed posts.
   */
  @HttpPost(':id/media')
  @UseInterceptors(FilesInterceptor('media', 10))
  async uploadMedia(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.uploadMediaForUser(
      id,
      request.authUser!.id,
      files,
    );
    return { post };
  }

  /**
   * Removes pending media from a post.
   */
  @Delete(':id/media/:mediaId')
  async deleteMedia(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('mediaId') mediaId: string,
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.deleteMediaForUser(
      id,
      request.authUser!.id,
      mediaId,
    );
    return { post };
  }

  /**
   * Publishes post to connected Telegram channel.
   * Accepts optional media files via multipart/form-data (field name: media).
   */
  @HttpPost(':id/publish')
  @UseInterceptors(FilesInterceptor('media', 10))
  async publish(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ): Promise<{ post: PostDto }> {
    const post = await this.postsService.publishForUser(
      id,
      request.authUser!.id,
      body,
      files,
    );
    return { post };
  }
}
