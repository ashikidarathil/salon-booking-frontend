'use client';

import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';

export function TrendingHairstyles() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          Trending Hairstyles
        </h2>
        <p className="text-muted-foreground">Get inspired by the latest trends</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="pt-0 overflow-hidden">
          <img
            alt="Modern Layers"
            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/artists-portfolios/portrait/4.webp"
            className="object-cover w-full h-64 rounded-t-xl"
          />
          <CardContent className="pt-6">
            <h3 className="mb-2 text-lg font-semibold">Modern Layers</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Versatile cut for texture and movement
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon icon="solar:eye-bold" className="size-4" />
                <span>2.3K views</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:heart-bold" className="size-4" />
                <span>432 saves</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pt-0 overflow-hidden">
          <img
            alt="Balayage Blonde"
            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/artists-portfolios/portrait/2.webp"
            className="object-cover w-full h-64 rounded-t-xl"
          />
          <CardContent className="pt-6">
            <h3 className="mb-2 text-lg font-semibold">Balayage Blonde</h3>
            <p className="mb-3 text-sm text-muted-foreground">Sun-kissed color meets highlights</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon icon="solar:eye-bold" className="size-4" />
                <span>3.8K views</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:heart-bold" className="size-4" />
                <span>567 saves</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pt-0 overflow-hidden">
          <img
            alt="Textured Bob"
            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/artists-portfolios/portrait/5.webp"
            className="object-cover w-full h-64 rounded-t-xl"
          />
          <CardContent className="pt-6">
            <h3 className="mb-2 text-lg font-semibold">Textured Bob</h3>
            <p className="mb-3 text-sm text-muted-foreground">Chic, easy-to-maintain style</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon icon="solar:eye-bold" className="size-4" />
                <span>1.9K views</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:heart-bold" className="size-4" />
                <span>298 saves</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
