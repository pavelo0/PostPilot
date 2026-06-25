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

type PostsListResponse = {
  posts: Post[]
}

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery,
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/api/posts',
      transformResponse: (response: PostsListResponse) => response.posts,
      providesTags: ['Posts'],
    }),
  }),
})

export const { useGetPostsQuery } = postsApi
