'use client';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function HeroSection() {
  const navigate = useNavigate();
  const { selectedBranch } = useAppSelector((state) => state.branch);

  const handleBookAppointment = () => {
    if (selectedBranch) {
      navigate('/services');
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
            onClick={() => navigate('/branches')}
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
    </section>
  );
}
