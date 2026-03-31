'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchBranchServicePublicDetails,
  fetchBranchServicesPublicPaginated,
} from '@/features/branchService/branchService.thunks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { LoadingGate } from '@/components/common/LoadingGate';
import { clearError } from '@/features/branchService/branchService.slice';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { BranchServiceItem } from '@/features/branchService/branchService.types';
import { fetchBranchStylists } from '@/features/stylistBranch/stylistBranch.thunks';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';
import { fetchReviews } from '@/features/review/state/review.thunks';
import { addToCart } from '@/features/cart/cart.slice';
import { cn } from '@/lib/utils';

export default function ServiceDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { branchId, serviceId } = useParams<{
    branchId: string;
    serviceId: string;
  }>();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentService, loading, error } = useAppSelector((state) => state.branchService);
  const { assignedStylists } = useAppSelector((state) => state.stylistBranch);
  const { reviews, isLoading: isLoadingReviews } = useAppSelector((state) => state.review);

  const [imageError, setImageError] = useState(false);
  const [relatedServices, setRelatedServices] = useState<BranchServiceItem[]>([]);

  const cart = useAppSelector((state) => state.cart);

  useEffect(() => {
    const savedBranch = localStorage.getItem('selectedBranch');

    if (!savedBranch) {
      localStorage.setItem('returnPath', `/branches/${branchId}/services/${serviceId}`);
      navigate('/branches');
    }
  }, [navigate, branchId, serviceId]);

  useEffect(() => {
    if (branchId && serviceId) {
      dispatch(fetchBranchServicePublicDetails({ branchId, serviceId }));
      dispatch(fetchBranchStylists(branchId));
      dispatch(
        fetchReviews({
          serviceId,
          limit: 3,
          sortBy: 'rating',
          sortOrder: 'desc',
        }),
      );
    }
  }, [dispatch, branchId, serviceId]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (currentService?.categoryId && branchId && serviceId) {
        try {
          const result = await dispatch(
            fetchBranchServicesPublicPaginated({
              branchId,
              categoryId: currentService.categoryId,
              limit: 10,
            }),
          );
          if (
            result.meta.requestStatus === 'fulfilled' &&
            result.payload &&
            typeof result.payload !== 'string'
          ) {
            const related = result.payload.data.filter(
              (s: BranchServiceItem) => s.serviceId !== serviceId,
            );
            setRelatedServices(related.slice(0, 8));
          }
        } catch (error) {
          console.error('Failed to fetch related services:', error);
        }
      }
    };
    fetchRelated();
  }, [currentService?.categoryId, branchId, serviceId, dispatch]);

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      localStorage.setItem('returnPath', window.location.pathname);
      navigate('/login');
      return;
    }
    if (currentService) {
      dispatch(
        addToCart({
          item: {
            serviceId: currentService.serviceId,
            name: currentService.name,
            price: currentService.price,
            duration: currentService.duration,
            imageUrl: currentService.imageUrl,
          },
          branchId: branchId!,
        }),
      );
    }
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      localStorage.setItem('returnPath', window.location.pathname);
      navigate('/login');
      return;
    }
    if (currentService) {
      dispatch(
        addToCart({
          item: {
            serviceId: currentService.serviceId,
            name: currentService.name,
            price: currentService.price,
            duration: currentService.duration,
            imageUrl: currentService.imageUrl,
          },
          branchId: branchId!,
        }),
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <LoadingGate
          loading={loading}
          error={error}
          data={currentService}
          resetError={() => dispatch(clearError())}
          backPath="/services"
          loadingMessage="Loading service details..."
        >
          <div className="container max-w-6xl px-4 py-8 mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/services')}
                className="gap-2 pl-0 text-muted-foreground hover:text-primary hover:bg-transparent"
              >
                <Icon icon="lucide:arrow-left" className="size-4" />
                Back to Services
              </Button>
            </div>

            <div className="mb-8">
              {/* Category badge — full row on mobile, inline on desktop */}
              <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:gap-4">
                {currentService?.categoryName && (
                  <Badge className="self-start px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary">
                    {currentService.categoryName}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold sm:text-4xl font-heading">
                  {currentService?.name
                    ? currentService.name.charAt(0).toUpperCase() + currentService.name.slice(1)
                    : ''}
                </h1>
              </div>
              {currentService?.description && (
                <p className="text-lg text-muted-foreground">
                  {currentService?.description?.split('.')[0]}
                </p>
              )}
            </div>

            {/* Service Image & Pricing Card */}
            <Card className="mb-8 overflow-hidden shadow-sm border-border">
              <div className="relative w-full overflow-hidden bg-muted h-[480px] ">
                {currentService?.imageUrl && !imageError ? (
                  <img
                    src={currentService.imageUrl}
                    alt={currentService.name}
                    className="object-cover w-full h-full "
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <Icon icon="solar:bag-bold" className="text-gray-400 size-24" />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
                <div>
                  <span className="block mb-1 text-3xl font-bold">
                    ₹{currentService?.price?.toLocaleString('en-IN')}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon icon="solar:clock-circle-bold" className="size-4" />
                    <span>{currentService?.duration} minutes</span>
                  </div>
                </div>
                <div className="flex items-center w-full gap-3 md:w-auto">
                  <Button
                    size="lg"
                    onClick={handleBookAppointment}
                    className="flex-1 text-white shadow-lg md:flex-none bg-primary hover:bg-primary/90 shadow-primary/20"
                  >
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddToCart}
                    className={cn(
                      'rounded-lg border-border hover:bg-secondary h-11 w-11',
                      cart.items.some((i) => i.serviceId === serviceId)
                        ? 'bg-primary/10 border-primary text-primary'
                        : '',
                    )}
                  >
                    <Icon
                      icon={
                        cart.items.some((i) => i.serviceId === serviceId)
                          ? 'solar:cart-large-2-bold'
                          : 'solar:cart-large-2-linear'
                      }
                      className="size-5"
                    />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-8 mb-16 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Service Description */}
                {currentService?.description && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Service Description</CardTitle>
                    </CardHeader>
                    <CardContent className="leading-relaxed text-muted-foreground">
                      <p>{currentService.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* What's Included */}
                {currentService?.whatIncluded && currentService.whatIncluded.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {currentService.whatIncluded.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="p-1 mt-1 rounded h-fit bg-accent/10">
                              <Icon icon="solar:check-circle-bold" className="text-accent size-5" />
                            </div>
                            <div>
                              <p className="text-foreground">
                                {item.split(':')[0]}:
                                <span className="text-muted-foreground">
                                  {item.split(':')[1].charAt(0).toUpperCase() +
                                    item.split(':')[1].slice(1)}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Meet Your Stylists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {assignedStylists.slice(0, 4).map((stylist: BranchStylist) => (
                        <div
                          key={stylist.userId}
                          className="flex items-center gap-4 p-3 border rounded-lg"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <Icon icon="solar:user-bold" className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{stylist.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {stylist.specialization || 'Stylist'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {assignedStylists.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                          <Icon
                            icon="solar:users-group-rounded-bold"
                            className="mx-auto mb-3 size-12 text-muted-foreground/30"
                          />
                          <p className="text-sm">No stylists available currently</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review.id} className="pb-6 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center rounded-full size-8 bg-primary/10 text-primary">
                                  {review.userId.profilePicture ? (
                                    <img
                                      src={review.userId.profilePicture}
                                      alt={review.userId.name}
                                      className="rounded-full size-full"
                                    />
                                  ) : (
                                    <Icon icon="solar:user-bold" className="size-4" />
                                  )}
                                </div>
                                <span className="text-sm font-semibold">{review.userId.name}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Icon
                                    key={i}
                                    icon="solar:star-bold"
                                    className={cn(
                                      'size-3.5',
                                      i < review.rating
                                        ? 'text-yellow-400'
                                        : 'text-muted-foreground/20',
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm italic leading-relaxed text-muted-foreground">
                                "{review.comment}"
                              </p>
                            )}
                            <p className="mt-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        ))
                      ) : isLoadingReviews ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <Icon
                            icon="solar:restart-bold"
                            className="mx-auto mb-3 size-12 text-muted-foreground/30 animate-spin"
                          />
                          <p className="text-sm">Loading reviews...</p>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <Icon
                            icon="solar:star-bold"
                            className="mx-auto mb-3 size-12 text-muted-foreground/30"
                          />
                          <p className="text-sm">Reviews coming soon</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Services Section */}
            {relatedServices.length > 0 && (
              <div className="mb-16">
                <div className="mb-10 text-center">
                  <h2 className="mb-2 text-3xl font-bold font-heading">Related Services</h2>
                  <p className="text-muted-foreground">
                    Complete your look with these complementary services
                  </p>
                </div>
                <div className="relative w-full md:px-12 mx-auto">
                  <Carousel
                    opts={{
                      align: 'start',
                      dragFree: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {relatedServices.map((service) => (
                        <CarouselItem
                          key={service.serviceId}
                          className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3"
                        >
                          <Card className="flex flex-col h-full pt-0 overflow-hidden transition-shadow hover:shadow-md">
                            <div className="relative w-full h-48 bg-muted">
                              {service.imageUrl ? (
                                <img
                                  src={service.imageUrl}
                                  alt={service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                                  <Icon icon="solar:bag-bold" className="text-gray-400 size-16" />
                                </div>
                              )}
                            </div>
                            <CardContent className="flex-1 pt-6">
                              <h3 className="mb-2 text-xl font-bold">
                                {service.name.charAt(0).toUpperCase() + service.name.slice(1)}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {service.description || 'Professional service'}
                              </p>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
                              <span className="text-2xl font-bold">₹{service.price}</span>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  navigate(`/branches/${branchId}/services/${service.serviceId}`);
                                  window.scrollTo(0, 0);
                                }}
                                className="border-border hover:bg-primary hover:text-white"
                              >
                                Learn More
                              </Button>
                            </CardFooter>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-12" />
                    <CarouselNext className="hidden md:flex -right-12" />
                  </Carousel>
                </div>
              </div>
            )}
          </div>
        </LoadingGate>
      </main>
      <Footer />
    </div>
  );
}
