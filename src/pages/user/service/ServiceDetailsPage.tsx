
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  fetchBranchServicePublicDetails,
  fetchBranchServicesPublicPaginated 
} from '@/features/branchService/branchService.thunks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { showError, showSuccess } from '@/common/utils/swal.utils';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import type { BranchServiceItem } from '@/features/branchService/branchService.types';

export default function ServiceDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { branchId, serviceId } = useParams<{
    branchId: string;
    serviceId: string;
  }>();

  const { currentService, loading, error } = useAppSelector((state) => state.branchService);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [imageError, setImageError] = useState(false);
  const [relatedServices, setRelatedServices] = useState<BranchServiceItem[]>([]);

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
              limit: 6,
            })
          );
          if (result.meta.requestStatus === 'fulfilled' && result.payload && typeof result.payload !== 'string') {
            const related = result.payload.data.filter((s: BranchServiceItem) => s.serviceId !== serviceId);
            setRelatedServices(related.slice(0, 3));
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
      showError(
        'Login Required',
        'Please login to book an appointment'
      );
      navigate('/login');
      return;
    }

    showSuccess(
      'Coming Soon',
      'Booking feature will be available soon!',
      1500
    );
  };

  if (loading || !currentService) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !currentService) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Icon icon="solar:info-circle-bold" className="mx-auto mb-4 text-red-500 size-16" />
            <p className="mb-4 text-lg text-muted-foreground">{error || 'Service not found'}</p>
            <Button onClick={() => navigate('/services')}>
              <Icon icon="solar:alt-arrow-left-bold" className="mr-2 size-4" />
              Back to Services
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
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

          {/* Service Title */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-bold font-heading">{currentService.name.charAt(0).toUpperCase() + currentService.name.slice(1)}</h1>
              {currentService.categoryName && (
                <Badge className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-accent text-accent-foreground hover:bg-accent/90">
                  {currentService.categoryName}
                </Badge>
              )}
            </div>
            {currentService.description && (
              <p className="text-lg text-muted-foreground">
                {currentService.description.split('.')[0]}
              </p>
            )}
          </div>

          {/* Service Image & Pricing Card */}
          <Card className="mb-8 overflow-hidden shadow-sm border-border">
            <div className="relative w-full overflow-hidden bg-muted h-[480px] ">
              {currentService.imageUrl && !imageError ? (
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
                <span className="block mb-1 text-3xl font-bold">₹{currentService.price.toLocaleString('en-IN')}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon icon="solar:clock-circle-bold" className="size-4" />
                  <span>{currentService.duration} minutes</span>
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
                  className="border-border hover:bg-secondary h-11 w-11 rounded-lg"
                >
                  <Icon icon="solar:cart-large-2-bold" className="size-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-8 mb-16 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Service Description */}
              {currentService.description && (
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
              {currentService.whatIncluded && currentService.whatIncluded.length > 0 && (
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
                            <p className='text-foreground'>{item.split(':')[0]}:<span className='text-muted-foreground'>{item.split(':')[1].charAt(0).toUpperCase() + item.split(':')[1].slice(1)}</span></p>
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
              {/* Meet Your Stylists - Placeholder */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Meet Your Stylists</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Icon icon="solar:users-group-rounded-bold" className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="text-sm">Stylist information coming soon</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Reviews - Placeholder */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    <Icon icon="solar:star-bold" className="mx-auto mb-3 size-12 text-muted-foreground/30" />
                    <p className="text-sm">Reviews coming soon</p>
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
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {relatedServices.map((service) => (
                  <Card
                    key={service.serviceId}
                    className="flex flex-col h-full pt-0 overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <div className="relative w-full h-48 bg-muted">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                          <Icon icon="solar:bag-bold" className="text-gray-400 size-16" />
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 pt-6">
                      <h3 className="mb-2 text-xl font-bold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {service.description ? service.description.substring(0, 100) + '...' : 'Professional service'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
                      <span className="text-2xl font-bold">₹{service.price}</span>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/branch/${branchId}/service/${service.serviceId}`)}
                        className="border-border hover:bg-primary hover:text-white"
                      >
                        Learn More
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
