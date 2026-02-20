'use client';

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPublicStylistById } from '@/features/stylistInvite/stylistInviteThunks';
import { loadSelectedBranchFromStorage } from '@/features/branch/branch.slice';
import { LoadingGate } from '@/components/common/LoadingGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';

export default function StylistDetailsPage() {
  const { stylistId } = useParams<{ stylistId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedStylist, loading, error } = useAppSelector((state) => state.stylistInvite);

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
    <div className="min-h-screen bg-background font-sans text-foreground pb-12 w-full flex flex-col">
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
                  <button className="absolute top-0 right-0 p-2 rounded-full bg-white shadow-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon icon="solar:heart-linear" className="size-5" />
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
                        {selectedStylist?.rating?.toFixed(1) || '5.0'}
                      </span>
                      <span className="text-muted-foreground">
                        ({selectedStylist?.reviewCount || '142'} reviews)
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
                <Card className="border-none shadow-sm h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon icon="solar:gallery-bold" className="size-5" />
                        </div>
                        <CardTitle className="text-lg">Signature Works</CardTitle>
                      </div>
                      <Badge variant="outline" className="font-normal border-amber-200 bg-amber-50 text-amber-700">
                        Coming Soon
                      </Badge>
                    </div>
                    <CardDescription>
                      {selectedStylist?.name}'s most popular styles and transformations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group cursor-not-allowed grayscale">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted relative">
                          <img
                            src="https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80"
                            alt="Blonde Balayage"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                            <Icon icon="solar:lock-bold" className="size-8 text-white/50" />
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900">Blonde Balayage</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Natural sun-kissed look color blending
                        </p>
                      </div>
                      <div className="group cursor-not-allowed grayscale">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-muted relative">
                          <img
                            src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80"
                            alt="Layered Bob"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                            <Icon icon="solar:lock-bold" className="size-8 text-white/50" />
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900">Layered Bob</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Modern and versatile cut for any occasion
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon icon="solar:chat-square-like-bold" className="size-5" />
                        </div>
                        <CardTitle className="text-lg">Client Reviews</CardTitle>
                      </div>
                      <Badge variant="outline" className="font-normal border-amber-200 bg-amber-50 text-amber-700">
                        Coming Soon
                      </Badge>
                    </div>
                    <CardDescription>What clients say about {selectedStylist?.name}'s work</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-5 rounded-xl opacity-60">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <div className="flex text-amber-400 mb-3">
                        <Icon icon="solar:star-bold" className="size-3.5" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Professional transformation with beautiful details. Really listens to client
                        needs.
                      </p>
                    </div>
                    <div className="bg-muted/50 p-5 rounded-xl opacity-60">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">Michelle Chen</h4>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                      <div className="flex text-amber-400 mb-3">
                        <Icon icon="solar:star-bold" className="size-3.5" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Excellent haircut and great salon atmosphere. Highly professional service.
                      </p>
                    </div>
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
                      {selectedStylist?.bio || 'No bio added'}
                    </p>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStylist?.assignedServices &&
                        selectedStylist.assignedServices.length > 0 ? (
                          selectedStylist.assignedServices.map((service, idx) => (
                            <Badge
                              key={idx}
                              className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-normal rounded-md"
                            >
                              {service.charAt(0).toUpperCase() + service.slice(1)}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none font-normal rounded-md">
                            {selectedStylist?.specialization}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon icon="solar:phone-bold" className="size-5" />
                      </div>
                      <CardTitle className="text-lg">Contact Info</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg text-sm">
                      <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <Icon icon="solar:phone-calling-bold" className="size-4" />
                      </div>
                      <span className="text-gray-700 font-medium">{selectedStylist?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg text-sm">
                      <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <Icon icon="solar:letter-bold" className="size-4" />
                      </div>
                      <span className="text-gray-700 font-medium truncate">
                        {selectedStylist?.email || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 bg-muted/50 p-3 rounded-lg text-[13px]">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                          <Icon icon="solar:clock-circle-bold" className="size-4" />
                        </div>
                        <span className="text-gray-900 font-semibold">Weekly Hours</span>
                      </div>
                      <div className="space-y-1 pl-11">
                        {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                          const dayData = selectedStylist?.weeklySchedule?.find(
                            (s) => s.dayOfWeek === dayNum,
                          );
                          const dayName = [
                            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
                          ][dayNum];

                          return (
                            <div key={dayNum} className="flex justify-between items-center pr-2">
                              <span className="text-muted-foreground w-10">{dayName}</span>
                              <span className="text-gray-700 font-medium">
                                {dayData?.isWorkingDay && dayData.shifts.length > 0
                                  ? dayData.shifts[0].startTime + ' - ' + dayData.shifts[0].endTime
                                  : 'Off'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg text-sm">
                      <div className="size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <Icon icon="solar:map-point-bold" className="size-4" />
                      </div>
                      <span className="text-gray-700 font-medium">{selectedStylist?.branchName || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </LoadingGate>
      </main>

      <Footer />
    </div>
  );
}
