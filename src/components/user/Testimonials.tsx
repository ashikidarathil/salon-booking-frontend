'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { reviewService } from '@/features/review/review.service';
import type { Review } from '@/features/review/review.types';
import { Skeleton } from '../ui/skeleton';

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getReviews({
          limit: 6,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        setReviews(data.reviews);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="container px-4 py-16 mx-auto md:py-24 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-12" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          What Our Clients Say
        </h2>
        <p className="text-muted-foreground">Real reviews from our valued customers</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  alt={review.userId.name}
                  src={
                    review.userId.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      review.userId.name,
                    )}&background=random`
                  }
                  className="rounded-full size-12 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{review.userId.name}</h4>
                  <p className="text-sm text-muted-foreground">Verified Client</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    icon="solar:star-bold"
                    className={`size-4 ${
                      i < review.rating
                        ? 'text-yellow-400 [&>path]:fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                "{review.comment || 'Great experience!'}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
