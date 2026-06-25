import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/**
 * Shared fetch base query for all RTK Query API slices.
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json')
    return headers
  },
})
