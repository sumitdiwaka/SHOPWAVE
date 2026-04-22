import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../api/services';
import toast from 'react-hot-toast';

const storedUser = localStorage.getItem('user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getProfile();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.updateProfile(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// ── Toggle wishlist thunk — updates Redux state with new wishlist from server ──
export const toggleWishlistItem = createAsyncThunk('auth/toggleWishlist', async (productId, { rejectWithValue }) => {
  try {
    const res = await authAPI.toggleWishlist(productId);
    return res.data; // { wishlist: [...ids], wishlistCount, inWishlist, message }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: localStorage.getItem('token') || null,
    wishlist: initialUser?.wishlist || [],  // array of product IDs or objects
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.wishlist = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handleAuth = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.wishlist = action.payload.user?.wishlist || [];
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };

    builder
      .addCase(loginUser.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled,  (s, a) => { handleAuth(s, a); toast.success('Welcome back!'); })
      .addCase(loginUser.rejected,   (s, a) => { s.loading = false; s.error = a.payload; toast.error(a.payload); })

      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { handleAuth(s, a); toast.success('Account created!'); })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; toast.error(a.payload); })

      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.user = a.payload.user;
        // getProfile returns populated wishlist objects — store them
        s.wishlist = a.payload.user?.wishlist || [];
      })

      .addCase(updateProfile.fulfilled, (s, a) => {
        s.user = a.payload.user;
        localStorage.setItem('user', JSON.stringify(a.payload.user));
        toast.success('Profile updated!');
      })

      // ── Wishlist toggle: update count immediately in Redux ──
      .addCase(toggleWishlistItem.fulfilled, (s, a) => {
        s.wishlist = a.payload.wishlist || [];
        toast.success(a.payload.message);
      })
      .addCase(toggleWishlistItem.rejected, (_, a) => {
        toast.error(a.payload || 'Wishlist update failed');
      });
  },
});

// ── Selectors ──
export const selectWishlistCount = (state) => state.auth.wishlist?.length || 0;
export const selectWishlist      = (state) => state.auth.wishlist || [];
export const selectIsInWishlist  = (productId) => (state) =>
  state.auth.wishlist?.some((item) =>
    typeof item === 'string' ? item === productId : item?._id === productId
  ) || false;

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;