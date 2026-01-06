// src/components/TopStylists.tsx
'use client';

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TopStylists() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
            Top Rated Stylists
          </h2>
          <p className="text-muted-foreground">Meet our expert stylists</p>
        </div>
        <Button variant="link" className="text-primary">
          View All
          <Icon icon="solar:arrow-right-bold" className="ml-1 size-5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stylist 1 */}
        <Card>
          <CardContent className="pt-6 text-center">
            <img
              alt="Stylist"
              src="https://randomuser.me/api/portraits/women/44.jpg"
              className="mx-auto mb-4 rounded-full size-24"
            />
            <h3 className="mb-1 text-lg font-semibold">Sarah Mitchell</h3>
            <p className="mb-3 text-sm text-muted-foreground">Hair Expert</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">5.0 (204)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="flex-1">
                <Icon icon="solar:chat-round-dots-bold" className="size-5" />
              </Button>
              <Button className="flex-1 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Repeat for other stylists — you can copy-paste and change image/name */}
        {/* Stylist 2 */}
        <Card>
          <CardContent className="pt-6 text-center">
            <img
              alt="Stylist"
              src="https://randomuser.me/api/portraits/men/32.jpg"
              className="mx-auto mb-4 rounded-full size-24"
            />
            <h3 className="mb-1 text-lg font-semibold">James Davis</h3>
            <p className="mb-3 text-sm text-muted-foreground">Senior Stylist</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">4.9 (187)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="flex-1">
                <Icon icon="solar:chat-round-dots-bold" className="size-5" />
              </Button>
              <Button className="flex-1 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stylist 3 */}
        <Card>
          <CardContent className="pt-6 text-center">
            <img
              alt="Stylist"
              src="https://randomuser.me/api/portraits/women/68.jpg"
              className="mx-auto mb-4 rounded-full size-24"
            />
            <h3 className="mb-1 text-lg font-semibold">Emma Chen</h3>
            <p className="mb-3 text-sm text-muted-foreground">Color Specialist</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">5.0 (312)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="flex-1">
                <Icon icon="solar:chat-round-dots-bold" className="size-5" />
              </Button>
              <Button className="flex-1 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stylist 4 */}
        <Card>
          <CardContent className="pt-6 text-center">
            <img
              alt="Stylist"
              src="https://randomuser.me/api/portraits/men/52.jpg"
              className="mx-auto mb-4 rounded-full size-24"
            />
            <h3 className="mb-1 text-lg font-semibold">Michael Johnson</h3>
            <p className="mb-3 text-sm text-muted-foreground">Master Hair Specialist</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  icon="solar:star-bold"
                  className="size-4 [&>path]:fill-primary text-primary"
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">4.9 (228)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="flex-1">
                <Icon icon="solar:chat-round-dots-bold" className="size-5" />
              </Button>
              <Button className="flex-1 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
