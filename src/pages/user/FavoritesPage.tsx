import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyFavorites, toggleFavorite } from '@/features/wishlist/wishlistSlice';
import { fetchPublicStylists } from '@/features/stylistInvite/stylistInviteThunks';
import { LoadingGate } from '@/components/common/LoadingGate';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '@/common/constants/app.routes';

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
  } = useAppSelector((state) => state.wishlist);
  const {
    stylists,
    loading: stylistsLoading,
    error: stylistsError,
  } = useAppSelector((state) => state.stylistInvite);
  const { selectedBranch } = useAppSelector((state) => state.branch);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyFavorites({ branchId: selectedBranch?.id }));
    }
  }, [dispatch, isAuthenticated, selectedBranch?.id]);

  useEffect(() => {
    dispatch(
      fetchPublicStylists({
        branchId: selectedBranch?.id,
        limit: 100,
      }),
    );
  }, [dispatch, selectedBranch?.id]);

  const favoriteStylists = stylists.filter((s) => favorites.includes(s.id));

  const handleToggleFavorite = (e: React.MouseEvent, stylistId: string) => {
    e.stopPropagation();
    dispatch(toggleFavorite(stylistId));
  };

  const getPositionLabel = (pos?: string) => {
    switch (pos) {
      case 'SENIOR':
        return 'Senior Stylist';
      case 'JUNIOR':
        return 'Junior Stylist';
      case 'TRAINEE':
        return 'Trainee Stylist';
      default:
        return 'Stylist';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <main className="flex-1 container mx-auto px-4 py-12 pl-7 pr-7">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">My Favorites</h1>
            <p className="text-muted-foreground">Your preferred stylists in one place</p>
          </div>
        </div>

        <LoadingGate
          loading={favoritesLoading || (stylistsLoading && favoriteStylists.length === 0)}
          error={favoritesError || stylistsError}
          data={favoriteStylists}
          emptyMessage="You haven't added any favorites yet."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteStylists.map((stylist) => (
              <Card
                key={stylist.id}
                className="group overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all pt-0 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={
                      stylist.profilePicture ||
                      'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
                    }
                    alt={stylist.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-destructive shadow-sm"
                    onClick={(e) => handleToggleFavorite(e, stylist.id)}
                  >
                    <Icon icon="solar:heart-bold" className="size-5" />
                  </button>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl mb-1">{stylist.name}</CardTitle>
                  <CardDescription>
                    {getPositionLabel(stylist.position)} • {stylist.experience} years exp.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 mt-auto">
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(APP_ROUTES.USER.STYLIST_DETAILS.replace(':stylistId', stylist.id))
                    }
                  >
                    View & Book
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </LoadingGate>
      </main>
    </div>
  );
}
