'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { reviewService } from '../../features/review/review.service';
import { Skeleton } from '../ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface TopStylist {
  stylistId: string;
  stylistName: string;
  avatar?: string;
  averageRating: number;
  totalReviews: number;
  bookingCount: number;
}

export function TopStylists() {
  const [stylists, setStylists] = useState<TopStylist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopStylists = async () => {
      try {
        const data = await reviewService.getTopStylists(6);
        setStylists(data);
      } catch (error) {
        console.error('Failed to fetch top stylists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopStylists();
  }, []);

  if (loading) {
    return (
      <section className="container px-4 py-16 mx-auto md:py-24">
        <div className="flex items-center justify-between mb-12">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (stylists.length === 0) return null;

  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
            Top Rated Stylists
          </h2>
          <p className="text-muted-foreground">Our most loved professionals</p>
        </div>
        <Button variant="link" className="text-primary" onClick={() => navigate('/stylists')}>
          View All
          <Icon icon="solar:arrow-right-bold" className="ml-1 size-5" />
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stylists.map((stylist) => (
          <Card key={stylist.stylistId} className="group hover:border-primary/20 transition-all">
            <CardContent className="pt-6 text-center">
              <div className="relative mx-auto mb-4 w-fit">
                <img
                  alt={stylist.stylistName}
                  src={stylist.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  className="rounded-full size-24 object-cover border-2 border-primary/10 group-hover:border-primary/30 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1 border-2 border-white shadow-sm">
                  <StarIcon className="size-3 fill-white" />
                </div>
              </div>
              <h3 className="mb-1 text-lg font-semibold">{stylist.stylistName}</h3>
              <p className="mb-3 text-xs text-muted-foreground">Expert Professional</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon
                      key={i}
                      icon="solar:star-bold"
                      className={`size-4 ${
                        i <= Math.round(stylist.averageRating)
                          ? 'text-yellow-400 [&>path]:fill-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-1 text-xs font-semibold text-gray-700">
                  {stylist.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">({stylist.totalReviews})</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/stylists/${stylist.stylistId}`)}
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
