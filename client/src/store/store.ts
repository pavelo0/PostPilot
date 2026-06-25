import { configureStore } from '@reduxjs/toolkit'
import { postsApi } from '@/store/api/posts-api'
import { authReducer } from '@/store/auth.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
