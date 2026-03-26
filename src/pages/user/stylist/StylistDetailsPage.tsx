'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicStylistById } from '@/features/stylistInvite/stylistInviteThunks';
import { fetchMyFavorites } from '@/features/wishlist/wishlistSlice';
import { useWishlist } from '@/hooks/useWishlist';
import { loadSelectedBranchFromStorage } from '@/features/branch/branch.slice';
import { addToCart } from '@/features/cart/cart.slice';
import { reviewService } from '@/features/review/review.service';
import type { Review } from '@/features/review/review.types';
import { LoadingGate } from '@/components/common/LoadingGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { SlotBookingDialog } from '@/components/booking/SlotBookingDialog';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function StylistDetailsPage() {
  const { stylistId } = useParams<{ stylistId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedStylist, loading, error } = useAppSelector((state) => state.stylistInvite);
  const { isFavorite, handleToggleFavorite, isAuthenticated } = useWishlist();
  const { selectedBranch } = useAppSelector((state) => state.branch);

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<{
    serviceId: string;
    name: string;
    price: number;
    duration: number;
  } | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (selectedStylist?.id) {
      (async () => {
        try {
          setLoadingReviews(true);
          const res = await reviewService.getReviews({
            stylistId: selectedStylist.id,
            limit: 3,
            sortBy: 'rating',
            sortOrder: 'desc',
          });
          if (isMounted) setReviews(res.reviews);
        } catch (err) {
          console.error('Failed to fetch reviews:', err);
        } finally {
          if (isMounted) setLoadingReviews(false);
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [selectedStylist?.id]);

  useEffect(() => {
    dispatch(loadSelectedBranchFromStorage());
    if (stylistId) {
      dispatch(fetchPublicStylistById({ stylistId }));
    }
  }, [dispatch, stylistId]);

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');
    if (!savedBranch) {
      localStorage.setItem('returnPath', window.location.pathname);
      navigate('/branches');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyFavorites());
    }
  }, [dispatch, isAuthenticated]);

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

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      localStorage.setItem('returnPath', window.location.pathname);
      navigate('/login');
      return;
    }

    const services = selectedStylist?.assignedServiceDetails || [];
    if (services.length > 0) {
      setIsServiceDialogOpen(true);
    }
  };

  const handleServiceSelect = (
    service: NonNullable<NonNullable<typeof selectedStylist>['assignedServiceDetails']>[number],
  ) => {
    setSelectedServiceForBooking({
      serviceId: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
    });
    setIsServiceDialogOpen(false);
    setIsBookingDialogOpen(true);
  };

  const stylistForDialog: BranchStylist[] = selectedStylist
    ? [
        {
          mappingId: '',
          branchId: selectedBranch?.id || '',
          stylistId: selectedStylist.id,
          userId: selectedStylist.userId,
          name: selectedStylist.name,
          specialization: selectedStylist.specialization,
          experience: selectedStylist.experience,
          stylistStatus: 'ACTIVE',
          assignedAt: new Date().toISOString(),
          profilePicture: selectedStylist.profilePicture,
        } as BranchStylist,
      ]
    : [];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground w-full flex flex-col">
      <Header />
      <main className="flex-1">
        <LoadingGate
          loading={loading && !selectedStylist}
          error={error}
          data={selectedStylist}
          emptyMessage="Stylist not found."
        >
          <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit"
              onClick={() => navigate(-1)}
            >
              <Icon icon="solar:arrow-left-linear" className="size-4" />
              <span>Back to Stylists</span>
            </div>

            <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-white overflow-visible">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 relative">
                  <button
                    className={`absolute top-0 right-0 p-2 rounded-full shadow-sm transition-colors ${
                      isFavorite(selectedStylist?.id || '')
                        ? 'text-destructive bg-white'
                        : 'bg-white text-muted-foreground hover:text-destructive'
                    }`}
                    onClick={(e) => handleToggleFavorite(e, selectedStylist?.id || '')}
                  >
                    <Icon
                      icon={
                        isFavorite(selectedStylist?.id || '')
                          ? 'solar:heart-bold'
                          : 'solar:heart-linear'
                      }
                      className="size-5"
                    />
                  </button>
                  <div className="flex-shrink-0 relative mx-auto md:mx-0">
                    <div className="relative">
                      <div className="size-32 rounded-full p-1 bg-white shadow-md">
                        <img
                          src={
                            selectedStylist?.profilePicture ||
                            'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop'
                          }
                          alt={selectedStylist?.name}
                          className="rounded-full w-full h-full object-cover"
                        />
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-primary hover:bg-primary/90 text-white border-2 border-white px-2 py-0.5 shadow-sm rounded-full">
                        Top Rated
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-grow text-center md:text-left space-y-3 pt-2">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
                        {selectedStylist?.name}
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        {getPositionLabel(selectedStylist?.position)} •{' '}
                        {selectedStylist?.experience} years experience
                      </p>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <div className="flex text-amber-400">
                        <Icon icon="solar:star-bold" className="size-4 md:size-5" />
                      </div>
                      <span className="font-bold text-gray-900">
                        {selectedStylist?.rating ? selectedStylist.rating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-muted-foreground">
                        ({selectedStylist?.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-muted-foreground text-sm">
                      <Icon icon="solar:map-point-bold" className="size-4 text-primary" />
                      <span>{selectedStylist?.branchName || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-center md:justify-end md:pb-2">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-lg px-8 h-12"
                      onClick={handleBookAppointment}
                    >
                      <Icon icon="solar:calendar-add-bold" className="mr-2 size-5" />
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm h-fit overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon icon="solar:gallery-bold" className="size-5" />
                        </div>
                        <CardTitle className="text-lg">Signature Works</CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className="font-normal border-amber-200 bg-amber-50 text-amber-700"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                    <CardDescription>
                      {selectedStylist?.name}'s most popular styles and transformations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl bg-muted/30 border border-dashed border-border/60 flex items-center justify-center group cursor-not-allowed"
                        >
                          <Icon
                            icon="solar:camera-bold-duotone"
                            className="size-8 text-muted-foreground/20 group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic text-center mt-4">
                      Portfolio selection is currently being curated.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon icon="solar:chat-square-like-bold" className="size-5" />
                        </div>
                        <CardTitle className="text-lg">Client Reviews</CardTitle>
                      </div>
                      {reviews.length > 0 && (
                        <Badge
                          variant="outline"
                          className="font-normal border-green-200 bg-green-50 text-green-700"
                        >
                          Top Reviews
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      What clients say about {selectedStylist?.name}'s work
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingReviews ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-muted/20 border border-border/40 opacity-40 select-none"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="size-8 rounded-full bg-muted animate-pulse" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-muted rounded animate-pulse" />
                              <div className="h-2 w-3/4 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 rounded-xl bg-muted/10 border border-border/40 transition-colors hover:border-primary/30"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    review.userId.profilePicture ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      review.userId.name,
                                    )}&background=random`
                                  }
                                  alt={review.userId.name}
                                  className="size-8 rounded-full object-cover"
                                />
                                <span className="font-semibold text-sm">{review.userId.name}</span>
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    icon="solar:star-bold"
                                    className={`size-3 ${
                                      i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                              "{review.comment || 'Great experience!'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 mt-2">
                        <div className="flex justify-center text-amber-400/30 gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Icon key={s} icon="solar:star-bold" className="size-5" />
                          ))}
                        </div>
                        <p className="text-sm font-semibold text-muted-foreground">
                          Be the first to review!
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Reviewing feature will be available after your next appointment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon icon="solar:user-id-bold" className="size-5" />
                      </div>
                      <CardTitle className="text-lg">About {selectedStylist?.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedStylist?.bio ||
                        `${selectedStylist?.name} is a dedicated professional at ${selectedStylist?.branchName || 'our branch'}, specializing in ${selectedStylist?.specialization}. With ${selectedStylist?.experience} years of experience, they provide top-tier services to all clients.`}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="bg-primary/[0.03] border-b border-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon icon="solar:phone-calling-bold" className="size-5" />
                      </div>
                      <CardTitle className="text-lg">Contact Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
                        <Icon icon="solar:letter-bold" className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                          Email Address
                        </p>
                        <p className="text-sm font-semibold truncate">
                          {selectedStylist?.email || 'Not shared publicly'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
                        <Icon icon="solar:phone-bold" className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
                          Phone Number
                        </p>
                        <p className="text-sm font-semibold">
                          {selectedStylist?.phone || 'Contact branch for details'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </LoadingGate>
      </main>
      <Footer />

      {/* Service Selection Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading">Select a Service</DialogTitle>
            <DialogDescription>
              Choose a service you'd like to book with {selectedStylist?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {selectedStylist?.assignedServiceDetails?.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon icon="solar:scissors-square-bold" className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-xs text-muted-foreground">{service.duration} mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{service.price}</p>
                  <Icon
                    icon="solar:alt-arrow-right-linear"
                    className="size-4 text-muted-foreground ml-auto mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      {selectedServiceForBooking && selectedBranch?.id && (
        <SlotBookingDialog
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          branchId={selectedBranch.id}
          selectedServices={[selectedServiceForBooking]}
          initialStylistId={selectedStylist?.userId}
          isCartMode={true}
          onSelect={(data) => {
            if (selectedServiceForBooking && selectedBranch?.id) {
              dispatch(
                addToCart({
                  branchId: selectedBranch.id,
                  item: {
                    serviceId: selectedServiceForBooking.serviceId,
                    name: selectedServiceForBooking.name,
                    price: selectedServiceForBooking.price,
                    duration: selectedServiceForBooking.duration,
                    stylistId: data.stylistId,
                    stylistName: data.stylistName,
                    date: data.date,
                    startTime: data.startTime,
                    slotId: data.slotId,
                  },
                }),
              );
              navigate('/cart');
            }
          }}
          availableStylists={stylistForDialog}
        />
      )}
    </div>
  );
}
