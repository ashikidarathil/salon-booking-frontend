import { createSlice } from '@reduxjs/toolkit';
import { fetchMyFavorites, toggleFavorite } from './wishlistThunks';

export * from './wishlistThunks';

interface WishlistState {
  favorites: string[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  favorites: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchMyFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.isAdded) {
          if (!state.favorites.includes(action.payload.stylistId)) {
            state.favorites.push(action.payload.stylistId);
          }
        } else {
          state.favorites = state.favorites.filter((id) => id !== action.payload.stylistId);
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
