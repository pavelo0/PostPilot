import { fetchBaseQuery, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'

const jsonBase = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

const multipartBase = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
})

/**
 * Shared base query for all RTK Query API slices.
 * Automatically omits Content-Type for FormData so the browser can set the
 * correct multipart boundary.
 */
export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
  args,
  api,
  extraOptions,
) => {
  if (typeof args !== 'string' && args.body instanceof FormData) {
    return multipartBase(args, api, extraOptions)
  }
  return jsonBase(args, api, extraOptions)
}
