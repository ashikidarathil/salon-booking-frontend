import React from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { clearCart, removeFromCart } from '@/features/cart/cart.slice';

interface FloatingCartBarProps {
  onCheckout: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onCheckout }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  if (items.length === 0) return null;

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Icon icon="solar:cart-large-2-bold" className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-foreground truncate">
              {items.length} {items.length === 1 ? 'Service' : 'Services'} Selected
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{totalDuration} mins</span>
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-xs py-1 scrollbar-hide">
            {items.map((item) => (
              <div key={item.serviceId} className="group relative flex-shrink-0">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
                  ) : (
                    <Icon
                      icon="solar:scissors-square-bold"
                      className="size-4 text-muted-foreground/40"
                    />
                  )}
                </div>
                <button
                  onClick={() => dispatch(removeFromCart(item.serviceId))}
                  className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon icon="ic:round-close" className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearCart())}
            className="text-muted-foreground hover:text-destructive hidden sm:flex"
          >
            Clear
          </Button>
          <Button
            onClick={onCheckout}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6 font-bold"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};
