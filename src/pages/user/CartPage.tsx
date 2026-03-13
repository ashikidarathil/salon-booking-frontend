import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import {
  removeFromCart,
  clearCart,
  updateStylist,
  updateItemSlot,
} from '@/features/cart/cart.slice';
import { Card } from '@/components/ui/card';
import { stylistBranchService } from '@/services/stylistBranch.service';
import type { BranchStylist } from '@/features/stylistBranch/stylistBranch.types';
import { SlotBookingDialog } from '@/components/booking/SlotBookingDialog';
import { createBooking as createBookingThunk } from '@/features/booking/booking.thunks';
import { fetchBranchStylists } from '@/features/stylistBranch/stylistBranch.thunks';
import { showError } from '@/common/utils/swal.utils';
import { resetBookingSuccess, clearBookingError } from '@/features/booking/booking.slice';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, branchId } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { assignedStylists: allBranchStylists } = useAppSelector((state) => state.stylistBranch);
  const {
    bookingSuccess,
    loading: bookingLoading,
    error: bookingError,
  } = useAppSelector((state) => state.booking);

  const [stylistsByService, setStylistsByService] = useState<Record<string, BranchStylist[]>>({});
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (branchId) {
      dispatch(fetchBranchStylists(branchId));
    }
  }, [branchId, dispatch]);

  const { currentBooking } = useAppSelector((state) => state.booking);

  useEffect(() => {
    if (bookingSuccess && currentBooking) {
      dispatch(clearCart());
      dispatch(resetBookingSuccess());
      navigate(`/checkout/${currentBooking.id}`);
    }
  }, [bookingSuccess, currentBooking, dispatch, navigate]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      showError('Booking Failed', bookingError);
      dispatch(clearBookingError());
    }
  }, [bookingError, dispatch]);

  const fetchStylists = useCallback(async () => {
    try {
      const promises = items.map((item) =>
        stylistBranchService.getStylistsByService(item.serviceId),
      );
      const results = await Promise.all(promises);
      const newStylistsMap: Record<string, BranchStylist[]> = {};

      results.forEach((res, index) => {
        if (res.data.success) {
          // Intersect service-capable stylists with branch-assigned stylists
          const serviceCapableStylists = res.data.data;
          const branchStylistsForService = allBranchStylists.filter((abs) =>
            serviceCapableStylists.some((scs: BranchStylist) => scs.userId === abs.userId),
          );
          newStylistsMap[items[index].serviceId] = branchStylistsForService;
        }
      });

      setStylistsByService(newStylistsMap);
    } catch (error) {
      console.error('Failed to fetch stylists:', error);
    }
  }, [items, allBranchStylists]);

  useEffect(() => {
    if (items.length > 0 && allBranchStylists.length > 0) {
      const timer = setTimeout(() => {
        fetchStylists();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchStylists, items.length, allBranchStylists.length]);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);
  const allSlotsSelected = items.every((item) => item.slotId);
  const activeItem = items.find((i) => i.serviceId === activeServiceId);

  const handleBookAll = async () => {
    if (!allSlotsSelected || bookingLoading) return;

    const bookingItems = items.map((item) => ({
      serviceId: item.serviceId,
      stylistId: item.stylistId!,
      date: item.date!,
      startTime: item.startTime!,
      slotId: item.slotId!,
    }));

    await dispatch(
      createBookingThunk({
        items: bookingItems,
      }),
    );
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/5 p-8 rounded-full mb-6">
            <Icon icon="solar:cart-large-2-broken" className="size-24 text-primary/40" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Looks like you haven't added any services yet. Browse our services to find the perfect
            treatment for you.
          </p>
          <Button onClick={() => navigate('/services')} size="lg" className="px-8 font-bold">
            Browse Services
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <Icon icon="solar:arrow-left-linear" className="size-6" />
          </Button>
          <h1 className="text-3xl font-bold">Booking Cart</h1>
          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={() => dispatch(clearCart())}
              className="text-destructive hover:text-white hover:bg-destructive"
            >
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.serviceId}
                  className="p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="size-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Icon
                          icon="solar:scissors-square-bold"
                          className="size-10 text-muted-foreground/30 m-auto mt-5 block"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                        <button
                          onClick={() => dispatch(removeFromCart(item.serviceId))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:bill-list-bold" className="text-primary size-4" />₹
                          {item.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:clock-circle-bold" className="text-primary size-4" />
                          {item.duration} mins
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/50">
                        {item.slotId ? (
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Assigned Slot
                              </span>
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full overflow-hidden bg-muted border border-border">
                                  {stylistsByService[item.serviceId]?.find(
                                    (s) => s.userId === item.stylistId,
                                  )?.profilePicture ? (
                                    <img
                                      src={
                                        stylistsByService[item.serviceId]?.find(
                                          (s) => s.userId === item.stylistId,
                                        )?.profilePicture
                                      }
                                      alt={item.stylistName}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <Icon
                                      icon="solar:user-bold"
                                      className="size-5 m-auto mt-1.5 text-muted-foreground/40 block"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{item.stylistName}</p>
                                  <p className="text-[10px] text-primary font-medium">
                                    {item.date} at {item.startTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveServiceId(item.serviceId)}
                              className="text-xs h-8 px-2"
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground italic">
                              No time slot selected yet
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveServiceId(item.serviceId)}
                              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 hover:text-primary/80 transition-colors h-8"
                            >
                              Select Stylist & Time
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 shadow-lg border-primary/10">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Duration</span>
                  <span>{totalDuration} mins</span>
                </div>
                <div className="border-t border-dashed pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>
              </div>

              {/* Advance Payment Notice */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Icon icon="solar:shield-check-bold" className="size-4" />
                  <span>20% Advance Required at Checkout</span>
                </div>
                <p className="text-[11px] text-primary/60 leading-relaxed">
                  The exact advance amount will be calculated by the system at checkout. The
                  remaining 80% is paid at the saloon after your service.
                </p>
              </div>

              {!allSlotsSelected && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex gap-3">
                  <Icon icon="solar:info-circle-bold" className="size-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Please select a stylist and time slot for each service to proceed.
                  </p>
                </div>
              )}

              <Button
                onClick={handleBookAll}
                disabled={!allSlotsSelected || bookingLoading}
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
              >
                {bookingLoading ? (
                  <>
                    <Icon icon="eos-icons:loading" className="mr-2 size-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground mt-4">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {branchId && activeServiceId && activeItem && (
        <SlotBookingDialog
          isOpen={!!activeServiceId}
          onClose={() => setActiveServiceId(null)}
          branchId={branchId}
          selectedServices={[
            {
              serviceId: activeItem.serviceId,
              name: activeItem.name,
              price: activeItem.price,
              duration: activeItem.duration,
            },
          ]}
          availableStylists={stylistsByService[activeItem.serviceId]}
          onSelect={(data) => {
            dispatch(
              updateStylist({
                serviceId: activeItem.serviceId,
                stylistId: data.stylistId,
                stylistName: data.stylistName,
              }),
            );
            dispatch(
              updateItemSlot({
                serviceId: activeItem.serviceId,
                date: data.date,
                startTime: data.startTime,
                slotId: data.slotId,
              }),
            );
          }}
        />
      )}
    </div>
  );
}
