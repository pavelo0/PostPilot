import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { ApiError, getMe, type AuthUser } from '@/utils/auth/auth.api'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type AuthState = {
  status: AuthStatus
  user: AuthUser | null
  bootstrapResolved: boolean
}

const initialState: AuthState = {
  status: 'idle',
  user: null,
  bootstrapResolved: false,
}

/**
 * Bootsraps the current user session from cookie-based auth.
 */
export const bootstrapAuth = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: 'unauthorized' | 'request_failed' }
>('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const response = await getMe()
    return response.user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return rejectWithValue('unauthorized')
    }
    return rejectWithValue('request_failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
      state.status = 'authenticated'
      state.bootstrapResolved = true
    },
    clearAuthState(state) {
      state.user = null
      state.status = 'unauthenticated'
      state.bootstrapResolved = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload
        state.bootstrapResolved = true
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'unauthenticated'
        state.user = null
        state.bootstrapResolved = true
      })
  },
})

export const { clearAuthState, setAuthenticatedUser } = authSlice.actions
export const authReducer = authSlice.reducer
