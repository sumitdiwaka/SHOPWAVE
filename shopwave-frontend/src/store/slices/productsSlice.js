import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../api/services';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await productAPI.getAll(params); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try { const res = await productAPI.getFeatured(); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try { const res = await productAPI.getCategories(); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await productAPI.getOne(id); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], featured: [], categories: [],
    current: null, total: 0, pages: 1, page: 1,
    loading: false, error: null,
    filters: { keyword: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { keyword: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload.products;
        s.total = a.payload.total; s.pages = a.payload.pages; s.page = a.payload.page;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload.products; })
      .addCase(fetchCategories.fulfilled, (s, a) => { s.categories = a.payload.categories; })
      .addCase(fetchProduct.pending, (s) => { s.loading = true; s.current = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.current = a.payload.product; })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
