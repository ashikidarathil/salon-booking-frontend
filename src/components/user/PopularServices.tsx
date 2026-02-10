'use client';

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PopularServices() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          Popular Services
        </h2>
        <p className="text-muted-foreground">Discover our most-booked services</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
              <Icon icon="solar:scissors-bold" className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Hair Cut</h3>
            <p className="mb-3 text-sm text-muted-foreground">Professional cut and styling</p>
            <div className="mb-1 font-semibold text-primary">$25+ · Starting from</div>
            <Button variant="link" className="text-primary">
              Book Now
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-secondary/10">
              <Icon icon="solar:pallete-bold" className="size-8 text-secondary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Hair Coloring</h3>
            <p className="mb-3 text-sm text-muted-foreground">Expert color transformation</p>
            <div className="mb-1 font-semibold text-secondary">$60+ · Starting from</div>
            <Button variant="link" className="text-secondary">
              Book Now
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
              <Icon icon="solar:cup-hot-bold" className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Hair Treatment</h3>
            <p className="mb-3 text-sm text-muted-foreground">Deep conditioning & repair</p>
            <div className="mb-1 font-semibold text-primary">$50+ · Starting from</div>
            <Button variant="link" className="text-primary">
              Book Now
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
              <Icon icon="solar:fire-bold" className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Hair Styling</h3>
            <p className="mb-3 text-sm text-muted-foreground">Special event styling</p>
            <div className="mb-1 font-semibold text-primary">$40+ · Starting from</div>
            <Button variant="link" className="text-primary">
              Book Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
