import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { AuthCredentials, AuthResponse, AuthUser } from '../types/auth';
import type { ChannelItem, ConnectChannelInput } from '../types/channels';
import type { CreatePostInput, PostItem, UpdatePostInput } from '../types/posts';

type PostsListResponse = {
  posts: PostItem[];
};

type PostResponse = {
  post: PostItem;
};

type ChannelResponse = {
  channel: ChannelItem;
};

type SuccessResponse = {
  success: true;
};

/**
 * Returns true when base query error has exact HTTP status.
 */
function hasStatus(error: unknown, status: number): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as FetchBaseQueryError;
  return 'status' in candidate && candidate.status === status;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'Channel', 'Posts'],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<AuthUser | null, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: 'api/auth/me',
          method: 'GET',
        });

        if (result.error) {
          if (hasStatus(result.error, 401)) {
            return { data: null };
          }
          return { error: result.error };
        }

        const payload = result.data as AuthResponse;
        return { data: payload.user };
      },
      providesTags: ['Auth'],
    }),
    register: builder.mutation<AuthUser, AuthCredentials>({
      query: (credentials) => ({
        url: 'api/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => response.user,
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<AuthUser, AuthCredentials>({
      query: (credentials) => ({
        url: 'api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: AuthResponse) => response.user,
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<SuccessResponse, void>({
      query: () => ({
        url: 'api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getMyChannel: builder.query<ChannelItem | null, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: 'api/channels/me',
          method: 'GET',
        });

        if (result.error) {
          if (hasStatus(result.error, 404)) {
            return { data: null };
          }
          return { error: result.error };
        }

        const payload = result.data as ChannelResponse;
        return { data: payload.channel };
      },
      providesTags: ['Channel'],
    }),
    connectChannel: builder.mutation<ChannelItem, ConnectChannelInput>({
      query: (input) => ({
        url: 'api/channels/connect',
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: ChannelResponse) => response.channel,
      invalidatesTags: ['Channel'],
    }),
    listPosts: builder.query<PostItem[], void>({
      query: () => ({
        url: 'api/posts',
        method: 'GET',
      }),
      transformResponse: (response: PostsListResponse) => response.posts,
      providesTags: ['Posts'],
    }),
    getPost: builder.query<PostItem, string>({
      query: (postId) => ({
        url: `api/posts/${postId}`,
        method: 'GET',
      }),
      transformResponse: (response: PostResponse) => response.post,
      providesTags: ['Posts'],
    }),
    createPost: builder.mutation<PostItem, CreatePostInput>({
      query: (input) => ({
        url: 'api/posts',
        method: 'POST',
        body: input,
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: ['Posts'],
    }),
    updatePost: builder.mutation<
      PostItem,
      { postId: string; input: UpdatePostInput }
    >({
      query: ({ postId, input }) => ({
        url: `api/posts/${postId}`,
        method: 'PATCH',
        body: input,
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: ['Posts'],
    }),
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `api/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'],
    }),
    publishPost: builder.mutation<PostItem, string>({
      query: (postId) => ({
        url: `api/posts/${postId}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: PostResponse) => response.post,
      invalidatesTags: ['Posts'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMyChannelQuery,
  useConnectChannelMutation,
  useListPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePublishPostMutation,
} = apiSlice;
