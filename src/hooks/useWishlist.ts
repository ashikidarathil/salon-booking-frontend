import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleFavorite } from '@/features/wishlist/wishlistSlice';
import { APP_ROUTES } from '@/common/constants/app.routes';

export function useWishlist() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { favorites } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent | React.FocusEvent, stylistId: string) => {
      e.stopPropagation();
      if (!isAuthenticated) {
        navigate(APP_ROUTES.PUBLIC.LOGIN);
        return;
      }
      dispatch(toggleFavorite(stylistId));
    },
    [dispatch, navigate, isAuthenticated],
  );

  const isFavorite = useCallback((stylistId: string) => favorites.includes(stylistId), [favorites]);

  return {
    favorites,
    isFavorite,
    handleToggleFavorite,
    isAuthenticated,
  };
}
