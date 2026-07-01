import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from '@/store/api/base-query'

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export type PostMedia = {
  id: string
  mediaType: 'photo' | 'video'
  telegramFileId: string | null
  originalName: string | null
  mimeType: string | null
  order: number
  isPending: boolean
}

export type Post = {
  id: string
  userId: string
  channelId: string | null
  title: string | null
  body: string
  status: PostStatus
  scheduledAt: string | null
  telegramMessageId: number | null
  publishedAt: string | null
  errorMessage: string | null
  telegramPostUrl: string | null
  channelLabel: string | null
  createdAt: string
  updatedAt: string
  mediaItems: PostMedia[]
}

export type GetPostsParams = {
  page: number
  limit?: number
  status?: PostStatus
}

export type GetCalendarPostsParams = {
  from: string
  to: string
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

type CalendarPostsResponse = {
  posts: Post[]
}

export type CreatePostRequest = {
  title?: string
  body: string
  scheduledAt?: string
  channelId?: string
}

type UpdatePostRequest = {
  id: string
  title?: string
  body?: string
  scheduledAt?: string | null
  channelId?: string
}

type PostResponse = {
  post: Post
}

type PublishPostRequest = {
  id: string
  channelId?: string
  files?: File[]
}

type UploadPostMediaRequest = {
  id: string
  files: File[]
}

type DeletePostMediaRequest = {
  id: string
  mediaId: string
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
    getCalendarPosts: builder.query<Post[], GetCalendarPostsParams>({
      query: ({ from, to }) => {
        const params = new URLSearchParams({ from, to })
        return `/api/posts/calendar?${params.toString()}`
      },
      transformResponse: (response: CalendarPostsResponse) => response.posts,
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
      query: ({ id, channelId, files }) => {
        if (files?.length) {
          const form = new FormData()
          if (channelId) form.append('channelId', channelId)
          files.forEach((f) => form.append('media', f))
          return { url: `/api/posts/${id}/publish`, method: 'POST', body: form }
        }
        return {
          url: `/api/posts/${id}/publish`,
          method: 'POST',
          body: channelId ? { channelId } : {},
        }
      },
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: (_result, _error, { id }) => ['Posts', { type: 'Post', id }],
    }),
    uploadPostMedia: builder.mutation<Post, UploadPostMediaRequest>({
      query: ({ id, files }) => {
        const form = new FormData()
        files.forEach((file) => form.append('media', file))
        return {
          url: `/api/posts/${id}/media`,
          method: 'POST',
          body: form,
        }
      },
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: (_result, _error, { id }) => ['Posts', { type: 'Post', id }],
    }),
    deletePostMedia: builder.mutation<Post, DeletePostMediaRequest>({
      query: ({ id, mediaId }) => ({
        url: `/api/posts/${id}/media/${mediaId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: (_result, _error, { id }) => ['Posts', { type: 'Post', id }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetCalendarPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
  useUploadPostMediaMutation,
  useDeletePostMediaMutation,
} = postsApi
