'use client';

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';

export function Testimonials() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          What Our Clients Say
        </h2>
        <p className="text-muted-foreground">Real reviews from real customers</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                alt="Client"
                src="https://randomuser.me/api/portraits/women/28.jpg"
                className="rounded-full size-12"
              />
              <div>
                <h4 className="font-semibold">Jessica Williams</h4>
                <p className="text-sm text-muted-foreground">Loyal Client</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Amazing experience! Sarah did an incredible job with my hair color. The booking
              process was simple and the salon atmosphere was wonderful.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                alt="Client"
                src="https://randomuser.me/api/portraits/men/86.jpg"
                className="rounded-full size-12"
              />
              <div>
                <h4 className="font-semibold">David Lee</h4>
                <p className="text-sm text-muted-foreground">Happy Client</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Best haircut I've had in years! James understood what I wanted and delivered
              perfectly. The online booking system made scheduling so easy.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                alt="Client"
                src="https://randomuser.me/api/portraits/women/55.jpg"
                className="rounded-full size-12"
              />
              <div>
                <h4 className="font-semibold">Amanda Peterson</h4>
                <p className="text-sm text-muted-foreground">Regular Client</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Love the loyalty rewards program! Emma is fantastic and always makes me feel
              beautiful. I'm already looking forward to my next visit.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
