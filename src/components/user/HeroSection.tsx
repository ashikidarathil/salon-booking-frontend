import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function HeroSection() {
  const navigate = useNavigate();
  const { selectedBranch } = useAppSelector((state) => state.branch);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const handleBookAppointment = () => {
    if (selectedBranch) {
      navigate('/services');
    } else {
      navigate('/branches');
    }
  };

  const handleFindOnMap = () => {
    if (selectedBranch) {
      setIsMapDialogOpen(true);
    } else {
      navigate('/branches');
    }
  };

  return (
    <section className="container px-2 py-16 mx-auto md:py-24 ">
      <div className="max-w-3xl">
        <h1 className="mb-6 text-5xl font-bold tracking-tight font-heading md:text-6xl lg:text-7xl">
          Book Your Perfect
          <br />
          <span className="text-primary">Hair Style</span> Today
        </h1>
        <p className="max-w-xl mb-8 text-lg text-muted-foreground">
          Connect with top-rated stylists in your area. Easy booking, flexible scheduling, and
          exceptional service.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={handleFindOnMap}
            className="gap-2 px-6 py-3 font-semibold text-white bg-primary hover:bg-primary/90"
          >
            <Icon icon="solar:map-point-bold" className="size-5" />
            Find Us On The Map
          </Button>

          {/* Browse / Book Button (feature added, UI untouched) */}
          <Button
            size="lg"
            variant="outline"
            onClick={handleBookAppointment}
            className={`gap-2 font-semibold px-6 py-3 ${
              selectedBranch
                ? 'border-primary text-primary hover:bg-primary/10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon icon="solar:bag-bold" className="size-5" />
            {selectedBranch ? 'Browse Our Services' : 'Select Branch First'}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">Expert Stylists</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Clients</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4.9</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <Card className="px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Icon icon="solar:star-bold" className="size-8 text-primary" />
              <div>
                <div className="font-semibold">Top Rated</div>
                <div className="text-xs text-muted-foreground">Salon Service</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="solar:map-point-bold-duotone" className="size-5 text-primary" />
              Salon Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon icon="solar:shop-bold-duotone" className="size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{selectedBranch?.name || 'Salon Name'}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {selectedBranch?.address || 'Address not available'}
                </p>
              </div>
            </div>

            {selectedBranch?.latitude && selectedBranch?.longitude && (
              <Button
                variant="default"
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-11"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.latitude},${selectedBranch.longitude}`;
                  window.open(url, '_blank');
                }}
              >
                <Icon icon="solar:routing-bold-duotone" className="size-5" />
                Get Directions
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
