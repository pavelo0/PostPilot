import { ApiError } from './auth';
import type { CreatePostInput, PostItem, UpdatePostInput } from '../types/posts';

type PostsListResponse = {
  posts: PostItem[];
};

type PostResponse = {
  post: PostItem;
};

/**
 * Executes posts API request with cookie credentials.
 */
async function request<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = (await response.json()) as { message?: string };
      if (typeof payload.message === 'string' && payload.message.length > 0) {
        message = payload.message;
      }
    } catch {
      message = 'Request failed';
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (await response.json()) as TResponse;
}

/**
 * Returns current user's posts.
 */
export async function listPosts(): Promise<PostItem[]> {
  const response = await request<PostsListResponse>('/api/posts', { method: 'GET' });
  return response.posts;
}

/**
 * Creates new post.
 */
export async function createPost(input: CreatePostInput): Promise<PostItem> {
  const response = await request<PostResponse>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.post;
}

/**
 * Returns post by id.
 */
export async function getPost(postId: string): Promise<PostItem> {
  const response = await request<PostResponse>(`/api/posts/${postId}`, {
    method: 'GET',
  });
  return response.post;
}

/**
 * Updates existing post.
 */
export async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<PostItem> {
  const response = await request<PostResponse>(`/api/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.post;
}

/**
 * Deletes post by id.
 */
export async function deletePost(postId: string): Promise<void> {
  await request<{ success: true }>(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
}

/**
 * Publishes post in connected Telegram channel.
 */
export async function publishPost(postId: string): Promise<PostItem> {
  const response = await request<PostResponse>(`/api/posts/${postId}/publish`, {
    method: 'POST',
  });
  return response.post;
}
