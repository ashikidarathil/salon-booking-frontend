// src/components/SpecialOffers.tsx
'use client';

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SpecialOffers() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          Special Offers
        </h2>
        <p className="text-muted-foreground">Don't miss out on our exclusive deals</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center rounded-lg size-10 bg-primary-foreground/20">
                <Icon icon="solar:tag-bold" className="size-5" />
              </div>
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>
            <h3 className="mb-3 text-2xl font-semibold font-heading">20% Off First Booking</h3>
            <p className="mb-4 opacity-90">
              New customers get 20% off any service on their first appointment. Book now and
              experience our premium salon services.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="size-4" />
                <span>Valid for all services</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="size-4" />
                <span>No minimum spend required</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="size-4" />
                <span>Available for 30 days</span>
              </li>
            </ul>
            <Button variant="secondary" className="shadow-lg ">
              Claim Offer
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-green-700 border-0 from-secondary to-secondary/90 text-secondary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="flex items-center justify-center rounded-lg size-10 bg-secondary-foreground/20">
                <Icon icon="solar:gift-bold" className="text-white size-5" />
              </div>
              <span className="text-sm font-semibold text-white">Premium Package</span>
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-white font-heading">
              Free Treatment Add-on
            </h3>
            <p className="mb-4 text-white opacity-90">
              Book any coloring service and get a free deep conditioning treatment. Premium care for
              your hair.
            </p>
            <ul className="mb-6 space-y-2 text-white">
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="text-white size-4" />
                <span>Worth $50 value</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="text-white size-4" />
                <span>Expert beautician's choice</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Icon icon="solar:check-circle-bold" className="text-white size-4" />
                <span>Available while stocks last</span>
              </li>
            </ul>
            <Button variant="secondary" className="bg-white shadow-lg text-secondary">
              Book Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
