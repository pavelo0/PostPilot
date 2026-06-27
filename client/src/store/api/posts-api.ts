import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '@/store/api/base-query'

export type PostStatus = 'draft' | 'published' | 'failed'

export type Post = {
  id: string
  userId: string
  channelId: string | null
  title: string | null
  body: string
  status: PostStatus
  telegramMessageId: number | null
  publishedAt: string | null
  errorMessage: string | null
  telegramPostUrl: string | null
  createdAt: string
  updatedAt: string
}

export type GetPostsParams = {
  page: number
  limit?: number
  status?: PostStatus
}

type PostsListResponse = {
  posts: Post[]
  total: number
  hasMore: boolean
}

export type PostsPage = {
  posts: Post[]
  total: number
  hasMore: boolean
}

type CreatePostRequest = {
  title?: string
  body: string
}

type UpdatePostRequest = {
  id: string
  title?: string
  body?: string
}

type PostResponse = {
  post: Post
}

type PublishPostRequest = {
  id: string
  channelId?: string
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery,
  tagTypes: ['Posts', 'Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<PostsPage, GetPostsParams>({
      query: ({ page, limit = 12, status }) => {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (status) params.set('status', status)
        return `/api/posts?${params.toString()}`
      },
      transformResponse: (response: PostsListResponse): PostsPage => response,
      providesTags: ['Posts'],
    }),
    getPostById: builder.query<Post, string>({
      query: (id) => `/api/posts/${id}`,
      transformResponse: (response: PostResponse) => response.post,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (body) => ({
        url: '/api/posts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: ['Posts'],
    }),
    updatePost: builder.mutation<Post, UpdatePostRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/posts/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: (_result, _error, { id }) => ['Posts', { type: 'Post', id }],
    }),
    deletePost: builder.mutation<{ success: true }, string>({
      query: (id) => ({
        url: `/api/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),
    publishPost: builder.mutation<Post, PublishPostRequest>({
      query: ({ id, channelId }) => ({
        url: `/api/posts/${id}/publish`,
        method: 'POST',
        body: channelId ? { channelId } : {},
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: (_result, _error, { id }) => ['Posts', { type: 'Post', id }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
} = postsApi
