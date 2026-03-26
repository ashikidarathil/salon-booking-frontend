import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { fetchBookingDetails, applyCoupon, removeCoupon } from '@/features/booking/booking.thunks';
import { payWithWallet, processRazorpayPayment } from '@/features/payment/payment.thunks';
import { fetchMyWallet } from '@/features/wallet/wallet.thunks';
import { fetchAvailableCoupons } from '@/features/coupon/coupon.thunks';
import { showError } from '@/common/utils/swal.utils';
import { PaymentCountdown } from '@/components/common/PaymentCountdown';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PAYMENT_MESSAGES as PM } from '@/features/payment/payment.constants';

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentBooking, loading: bookingLoading } = useAppSelector((state) => state.booking);
  const { loading: paymentLoading } = useAppSelector((state) => state.payment);
  const { wallet } = useAppSelector((state) => state.wallet);
  const { availableCoupons } = useAppSelector((state) => state.coupon);

  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingDetails(bookingId));
    }
  }, [bookingId, dispatch]);

  useEffect(() => {
    dispatch(fetchMyWallet());
    dispatch(fetchAvailableCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (!currentBooking || !bookingId) return;
    if (
      currentBooking.status === 'CONFIRMED' ||
      currentBooking.paymentStatus === 'ADVANCE_PAID' ||
      currentBooking.paymentStatus === 'PAID'
    ) {
      navigate(`/payment/success/${bookingId}`, { replace: true });
    }
  }, [currentBooking, bookingId, navigate]);

  useEffect(() => {
    if (!currentBooking?.paymentWindowExpiresAt || currentBooking.status !== 'PENDING_PAYMENT')
      return;
    const expiry = new Date(currentBooking.paymentWindowExpiresAt).getTime();
    const tick = () => {
      if (Date.now() >= expiry) {
        setIsExpired(true);
        navigate(`/payment/failure/${bookingId}`);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [currentBooking?.paymentWindowExpiresAt, currentBooking?.status, bookingId, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode || !bookingId) return;
    try {
      await dispatch(applyCoupon({ bookingId, code: couponCode })).unwrap();
      toast.success('Coupon applied successfully!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleRemoveCoupon = async () => {
    if (!bookingId) return;
    try {
      await dispatch(removeCoupon(bookingId)).unwrap();
      setCouponCode('');
      toast.success('Coupon removed');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleRazorpayPayment = async () => {
    if (!bookingId || !currentBooking || isExpired) return;

    const result = await dispatch(processRazorpayPayment({ bookingId }));

    if (processRazorpayPayment.fulfilled.match(result)) {
      if (result.payload.status === 'success') {
        toast.success(PM.SUCCESS);
        navigate(`/payment/success/${bookingId}`);
      }
    } else {
      navigate(`/payment/failure/${bookingId}`);
    }
  };

  const handleWalletPayment = async () => {
    if (!bookingId || !currentBooking || isExpired) return;

    if (wallet && wallet.balance < currentBooking.advanceAmount) {
      showError('Insufficient Balance', 'Please top up your wallet or use Razorpay.');
      return;
    }

    const result = await dispatch(payWithWallet({ bookingId }));
    if (payWithWallet.fulfilled.match(result)) {
      toast.success(PM.SUCCESS);
      navigate(`/payment/success/${bookingId}`);
    } else {
      showError('Payment Failed', (result.payload as string) || PM.WALLET_PAY_FAILED);
    }
  };

  const handlePayment = () => {
    if (isExpired) {
      showError('Expired', 'Your session has expired. Please book again.');
      return;
    }
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleWalletPayment();
    }
  };

  if (bookingLoading || !currentBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon="eos-icons:loading" className="size-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          {currentBooking?.paymentWindowExpiresAt && (
            <PaymentCountdown expiresAt={currentBooking.paymentWindowExpiresAt} variant="header" />
          )}
        </div>

        {isExpired && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <Icon icon="solar:danger-bold" className="size-6" />
            <p>
              Your 10-minute payment window has expired. The slots have been released. Please start
              a new booking.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-100 transition-opacity duration-300">
          <div className={isExpired ? 'pointer-events-none opacity-50' : ''}>
            {/* Summary Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  {currentBooking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.serviceName}</span>
                      <span className="font-medium">₹{item.price}</span>
                    </div>
                  ))}

                  <div className="border-t border-dashed pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Amount</span>
                      <span className="font-medium">₹{currentBooking.totalPrice}</span>
                    </div>
                    {(currentBooking.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-red-600 text-sm font-medium">
                        <span>Coupon Discount</span>
                        <span>- ₹{currentBooking.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 border-t pt-2">
                      <span>Net Total</span>
                      <span>₹{currentBooking.payableAmount}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                    <div className="flex justify-between items-center text-primary">
                      <span className="text-sm font-bold uppercase tracking-tight">
                        Advance to Pay (20%)
                      </span>
                      <span className="text-2xl font-black">₹{currentBooking.advanceAmount}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <span>Remaining at Salon (80%)</span>
                      <span>₹{currentBooking.payableAmount - currentBooking.advanceAmount}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-2 border-t border-primary/10 pt-2 leading-relaxed">
                      Secure your slot by paying the 20% advance now. The remaining 80% balance is
                      payable after your service.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Apply Coupon</h2>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10 pr-10"
                      disabled={isExpired || !!currentBooking.couponId}
                    />
                    {currentBooking.couponId && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Remove coupon"
                      >
                        <Icon icon="solar:close-circle-bold" className="size-5" />
                      </button>
                    )}
                  </div>
                  {!currentBooking.couponId ? (
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      disabled={isExpired || !couponCode}
                      className="h-10"
                    >
                      Apply
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRemoveCoupon}
                      variant="ghost"
                      disabled={isExpired}
                      className="h-10 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {availableCoupons.filter((c) => currentBooking.totalPrice >= c.minBookingAmount)
                  .length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Applicable Coupons
                    </p>
                    <div className="grid gap-2">
                      {availableCoupons
                        .filter((coupon) => currentBooking.totalPrice >= coupon.minBookingAmount)
                        .map((coupon) => (
                          <div
                            key={coupon.id}
                            onClick={async () => {
                              if (!isExpired && bookingId && !currentBooking.couponId) {
                                setCouponCode(coupon.code);
                                try {
                                  await dispatch(
                                    applyCoupon({ bookingId, code: coupon.code }),
                                  ).unwrap();
                                  toast.success('Coupon applied successfully!');
                                } catch (error: unknown) {
                                  toast.error(
                                    error instanceof Error ? error.message : String(error),
                                  );
                                }
                              }
                            }}
                            className={`p-3 border rounded-xl transition-all ${
                              currentBooking.couponId === coupon.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-default'
                                : isExpired || currentBooking.couponId
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'border-dashed cursor-pointer hover:bg-primary/5 group'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm tracking-tight group-hover:text-primary">
                                {coupon.code}
                              </span>
                              <Badge variant="secondary" className="text-[10px] h-4">
                                {coupon.discountType === 'PERCENTAGE'
                                  ? `${coupon.discountValue}% OFF`
                                  : `₹${coupon.discountValue} OFF`}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Min order: ₹{coupon.minBookingAmount}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <div className={isExpired ? 'pointer-events-none opacity-50' : ''}>
            {/* Payment Section */}
            <div className="space-y-6">
              <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <Icon icon="solar:shield-check-bold" />
                  <span>20% Advance Required</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  To confirm your booking, a 20% advance payment is required. The remaining 80% will
                  be paid at the saloon.
                </p>
                <div className="text-3xl font-extrabold text-primary">
                  ₹{currentBooking.advanceAmount}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      disabled={isExpired}
                    />
                    <Icon icon="logos:razorpay-icon" className="size-6 mr-4" />
                    <div className="flex-1 font-medium">Razorpay / UPI / Card</div>
                    {paymentMethod === 'razorpay' && (
                      <Icon icon="solar:check-circle-bold" className="text-primary size-6" />
                    )}
                  </label>

                  <label
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="hidden"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      disabled={isExpired}
                    />
                    <Icon icon="solar:wallet-bold" className="size-6 mr-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Wallet Balance</div>
                      <div className="text-xs text-muted-foreground">
                        Available: ₹{wallet?.balance ?? '...'}
                      </div>
                    </div>
                    {paymentMethod === 'wallet' && (
                      <Icon icon="solar:check-circle-bold" className="text-primary size-6" />
                    )}
                  </label>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full mt-8 h-12 text-lg font-bold"
                  disabled={paymentLoading || isExpired}
                >
                  {paymentLoading ? (
                    <Icon icon="eos-icons:loading" className="mr-2 animate-spin" />
                  ) : isExpired ? (
                    'Expired'
                  ) : (
                    `Pay ₹${currentBooking.advanceAmount}`
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
