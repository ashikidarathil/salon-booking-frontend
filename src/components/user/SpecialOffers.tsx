'use client';

import { useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAvailableCoupons } from '@/features/coupon/coupon.thunks';
import { DiscountType, type Coupon } from '@/features/coupon/coupon.types';
import { format } from 'date-fns';
import { showSuccess } from '@/common/utils/swal.utils';

export function SpecialOffers() {
  const dispatch = useAppDispatch();
  const { availableCoupons, loading } = useAppSelector((state) => state.coupon);

  useEffect(() => {
    dispatch(fetchAvailableCoupons());
  }, [dispatch]);

  const topCoupons = useMemo(() => {
    if (!availableCoupons || availableCoupons.length === 0) return [];
    // Sort coupons by absolute or percentage discount to give customers the best first.
    const sorted = [...availableCoupons].sort((a, b) => {
      return b.discountValue - a.discountValue;
    });
    // Take top 2
    return sorted.slice(0, 2);
  }, [availableCoupons]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('Code Copied!', `${code} copied to clipboard.`);
  };

  if (loading && availableCoupons.length === 0) return null; // Wait for initial load
  if (topCoupons.length === 0) return null; // Don't render section if no coupons

  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          Special Offers
        </h2>
        <p className="text-muted-foreground">Don't miss out on our exclusive deals</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {topCoupons.map((coupon: Coupon, idx: number) => {
          const isPrimary = idx % 2 === 0;
          return (
            <Card
              key={coupon.id}
              className={`border-0 ${
                isPrimary
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                  : 'bg-green-700 from-secondary to-secondary/90 text-secondary-foreground'
              }`}
            >
              <CardContent className="pt-6 relative">
                <div className={`flex items-center gap-2 mb-4 ${!isPrimary ? 'text-white' : ''}`}>
                  <div
                    className={`flex items-center justify-center rounded-lg size-10 ${
                      isPrimary
                        ? 'bg-primary-foreground/20'
                        : 'bg-secondary-foreground/20 text-white'
                    }`}
                  >
                    <Icon
                      icon={isPrimary ? 'solar:tag-bold' : 'solar:gift-bold'}
                      className="size-5"
                    />
                  </div>
                  <span className="text-sm font-semibold tracking-widest uppercase opacity-80">
                    {coupon.code}
                  </span>
                </div>

                <h3
                  className={`mb-3 text-2xl font-semibold font-heading ${!isPrimary ? 'text-white' : ''}`}
                >
                  {coupon.discountType === DiscountType.PERCENTAGE
                    ? `${coupon.discountValue}% Off`
                    : `₹${coupon.discountValue} Off`}
                </h3>

                <p className={`mb-4 opacity-90 min-h-12 ${!isPrimary ? 'text-white' : ''}`}>
                  Use code <span className="font-mono font-bold">{coupon.code}</span> to get{' '}
                  {coupon.discountType === DiscountType.PERCENTAGE
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue}`}{' '}
                  discount on your booking!
                </p>

                <ul className={`mb-6 space-y-2 ${!isPrimary ? 'text-white' : ''}`}>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon
                      icon="solar:check-circle-bold"
                      className={`size-4 ${!isPrimary ? 'text-white' : ''}`}
                    />
                    <span>Min booking amount: ₹{coupon.minBookingAmount}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon
                      icon="solar:check-circle-bold"
                      className={`size-4 ${!isPrimary ? 'text-white' : ''}`}
                    />
                    <span>Max discount up to ₹{coupon.maxDiscountAmount}</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Icon
                      icon="solar:clock-circle-bold"
                      className={`size-4 ${!isPrimary ? 'text-white' : ''}`}
                    />
                    <span>Valid until {format(new Date(coupon.expiryDate), 'MMM do, yyyy')}</span>
                  </li>
                </ul>

                <Button
                  onClick={() => handleCopyCode(coupon.code)}
                  variant="outline"
                  className={`w-full shadow-lg font-bold border-0 ${
                    isPrimary
                      ? 'bg-white text-red-500 hover:bg-white/90 hover:text-red-600'
                      : 'bg-white text-green-700 hover:bg-white/90 hover:text-green-800'
                  }`}
                >
                  <Icon icon="solar:copy-line-duotone" className="mr-2" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
