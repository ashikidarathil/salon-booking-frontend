// FILE: frontend/src/pages/user/ServiceDetailsPage.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBranchServicePublicDetails } from '@/features/branchService/branchService.thunks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';

export default function ServiceDetailsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { branchId, serviceId } = useParams<{
    branchId: string;
    serviceId: string;
  }>();

  // Redux state
  const { selectedBranch } = useAppSelector((state) => state.branch);
  const { currentService, loading, error } = useAppSelector((state) => state.branchService);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [imageError, setImageError] = useState(false);

  // Verify branch matches
  useEffect(() => {
    if (!selectedBranch || selectedBranch.id !== branchId) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Branch',
        text: 'Please select the correct branch',
        confirmButtonText: 'Select Branch',
      }).then(() => {
        navigate('/branches');
      });
    }
  }, [selectedBranch, branchId, navigate]);

  // Fetch service details
  useEffect(() => {
    if (branchId && serviceId) {
      dispatch(fetchBranchServicePublicDetails({ branchId, serviceId }));
    }
  }, [dispatch, branchId, serviceId]);

  // Handle booking
  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to book an appointment',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // TODO: Navigate to booking page when ready
    Swal.fire({
      icon: 'success',
      title: 'Coming Soon',
      text: 'Booking feature will be available soon!',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Loading state
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
        <div className="container max-w-5xl px-4 py-8 mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/services')}
            className="mb-6 text-muted-foreground hover:text-primary"
          >
            <Icon icon="solar:alt-arrow-left-bold" className="mr-2 size-5" />
            Back to Services
          </Button>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left: Image Section */}
            <div>
              <Card className="overflow-hidden">
                <div className="relative w-full overflow-hidden bg-gray-200 h-96">
                  {currentService.imageUrl && !imageError ? (
                    <img
                      src={currentService.imageUrl}
                      alt={currentService.name}
                      className="object-cover w-full h-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                      <Icon icon="solar:bag-bold" className="text-gray-400 size-24" />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right: Details Section */}
            <div>
              {/* Category Badge */}
              {currentService.categoryName && (
                <div className="inline-flex mb-4">
                  <span className="text-xs font-bold text-white bg-primary px-4 py-1.5 rounded-full">
                    {currentService.categoryName}
                  </span>
                </div>
              )}

              {/* Service Name */}
              <h1 className="mb-2 text-4xl font-bold text-gray-900">{currentService.name}</h1>

              {/* Branch Info */}
              <p className="mb-6 text-lg text-muted-foreground">
                Available at{' '}
                <span className="font-semibold text-primary">{selectedBranch?.name}</span>
              </p>

              {/* Price & Duration Card */}
              <Card className="p-6 mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="grid grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-600">
                      <Icon icon="solar:money-bag-bold" className="inline mr-1 size-4" />
                      Price
                    </p>
                    <p className="text-4xl font-bold text-green-600">₹{currentService.price}</p>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-600">
                      <Icon icon="solar:clock-circle-bold" className="inline mr-1 size-4" />
                      Duration
                    </p>
                    <p className="text-4xl font-bold text-blue-600">{currentService.duration}</p>
                    <p className="text-xs text-gray-600">minutes</p>
                  </div>
                </div>
              </Card>

              {/* Book Button */}
              <Button
                onClick={handleBookAppointment}
                size="lg"
                className="w-full py-3 mb-4 font-semibold text-white bg-primary hover:bg-primary/90"
              >
                <Icon icon="solar:calendar-bold" className="mr-2 size-5" />
                Book Appointment
              </Button>

              {/* Branch Info Card */}
              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:home-bold" className="flex-shrink-0 mt-1 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available at</p>
                    <p className="font-semibold text-gray-900">{selectedBranch?.name}</p>
                    {selectedBranch?.address && (
                      <p className="mt-1 text-sm text-gray-600">{selectedBranch.address}</p>
                    )}
                    {selectedBranch?.phone && (
                      <p className="mt-1 text-sm text-gray-600">{selectedBranch.phone}</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Section: Description & What's Included */}
          <div className="mt-12 space-y-8">
            {/* What's Included Section */}
            {currentService.whatIncluded && currentService.whatIncluded.length > 0 && (
              <div className="pt-8 border-t">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="inline mr-2 text-green-600 size-6"
                  />
                  What's Included
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {currentService.whatIncluded.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        className="size-5 text-green-600 flex-shrink-0 mt-0.5"
                      />
                      <span className="font-medium text-gray-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            {currentService.description && (
              <div className="pt-8 border-t">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">About This Service</h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  {currentService.description}
                </p>
              </div>
            )}

            {/* Service Details Grid */}
            <div className="pt-8 border-t">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Service Details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Duration Card */}
                <Card className="p-4 text-center">
                  <Icon
                    icon="solar:clock-circle-bold"
                    className="mx-auto mb-2 text-blue-600 size-8"
                  />
                  <p className="mb-1 text-sm text-gray-600">Estimated Time</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentService.duration} minutes
                  </p>
                </Card>

                {/* Price Card */}
                <Card className="p-4 text-center">
                  <Icon
                    icon="solar-money-bag-bold"
                    className="mx-auto mb-2 text-green-600 size-8"
                  />
                  <p className="mb-1 text-sm text-gray-600">Service Price</p>
                  <p className="text-lg font-bold text-green-600">₹{currentService.price}</p>
                </Card>

                {/* Category Card */}
                {currentService.categoryName && (
                  <Card className="p-4 text-center">
                    <Icon icon="solar-tag-bold" className="mx-auto mb-2 text-purple-600 size-8" />
                    <p className="mb-1 text-sm text-gray-600">Category</p>
                    <p className="text-lg font-bold text-gray-900">{currentService.categoryName}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* CTA Section at Bottom */}
          <div className="pt-8 mt-12 text-center border-t">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Ready to book this service?</h3>
            <p className="mb-6 text-gray-600">
              Don't wait! Reserve your appointment now at {selectedBranch?.name}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                onClick={handleBookAppointment}
                size="lg"
                className="px-8 font-semibold text-white bg-primary hover:bg-primary/90"
              >
                <Icon icon="solar-calendar-bold" className="mr-2 size-5" />
                Book Now
              </Button>
              <Button
                onClick={() => navigate('/services')}
                size="lg"
                variant="outline"
                className="px-8 font-semibold border-primary text-primary hover:bg-primary/10"
              >
                <Icon icon="solar-arrow-left-bold" className="mr-2 size-5" />
                View More Services
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
