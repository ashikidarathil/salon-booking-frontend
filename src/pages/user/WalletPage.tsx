import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchMyWallet,
  fetchTransactionHistory,
  topUpWallet,
} from '@/features/wallet/wallet.thunks';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess, showError } from '@/common/utils/swal.utils';
import { type WalletTransaction, TransactionType } from '@/features/wallet/wallet.types';
import { getThemeColorByRole } from '@/features/wallet/wallet.constants';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const typeConfig: Record<
  TransactionType,
  { icon: string; color: string; bg: string; label: string }
> = {
  [TransactionType.CREDIT]: {
    icon: 'solar:arrow-down-bold',
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Credit',
  },
  [TransactionType.DEBIT]: {
    icon: 'solar:arrow-up-bold',
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Debit',
  },
};

const refTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  DEPOSIT: { label: 'Top-Up', icon: 'solar:wallet-money-bold', color: 'text-primary' },
  REFUND: { label: 'Refund', icon: 'solar:refresh-bold', color: 'text-blue-600' },
  BOOKING: { label: 'Booking', icon: 'solar:calendar-bold', color: 'text-amber-600' },
  ESCROW: { label: 'Escrow', icon: 'solar:shield-bold', color: 'text-slate-500' },
  WITHDRAWAL: { label: 'Withdrawal', icon: 'solar:card-send-bold', color: 'text-orange-500' },
};

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const type = typeConfig[tx.type];
  const refType = refTypeConfig[tx.referenceType ?? ''];
  const date = new Date(tx.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cleanDescription = tx.description
    .replace(/[a-fA-F0-9]{24}/g, '')
    .replace(/\s*for booking\s*$/i, '')
    .replace(/\s*booking\s*$/i, '')
    .trim();

  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors">
      <div
        className={`size-9 sm:size-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${type.bg}`}
      >
        <Icon icon={type.icon} className={`size-4 sm:size-5 ${type.color}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-medium text-slate-800 text-[13px] sm:text-sm truncate">{cleanDescription}</p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0.5">
          <span className="text-[10px] sm:text-[11px] text-slate-400">{date}</span>
          {refType && (
            <span
              className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 ${refType.color} whitespace-nowrap`}
            >
              <Icon icon={refType.icon} className="size-2 sm:size-2.5 inline mr-0.5 relative -top-[0.5px]" />
              {refType.label}
            </span>
          )}
        </div>
      </div>
      <p className={`font-bold text-sm sm:text-base flex-shrink-0 whitespace-nowrap mt-1 sm:mt-0 ${type.color}`}>
        {tx.type === TransactionType.CREDIT ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { wallet, transactions, isLoading } = useAppSelector((s) => s.wallet);
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyWallet());
    dispatch(fetchTransactionHistory());
  }, [dispatch]);

  const effectiveAmount = customAmount ? Number(customAmount) : topupAmount;

  const handleTopup = async () => {
    if (effectiveAmount < 100) {
      showError('Invalid Amount', 'Minimum top-up is ₹100');
      return;
    }
    setTopupLoading(true);
    setIsTopupOpen(false);

    const themeColor = getThemeColorByRole(user?.role);
    const result = await dispatch(topUpWallet({ amount: effectiveAmount, themeColor }));

    if (topUpWallet.fulfilled.match(result)) {
      setCustomAmount('');
      showSuccess('Top-Up Successful!', `₹${effectiveAmount} added to your wallet.`);
      dispatch(fetchTransactionHistory());
    } else if (topUpWallet.rejected.match(result)) {
      if (result.payload !== 'DISMISSED') {
        showError('Top-Up Failed', (result.payload as string) || 'Payment could not be processed');
      }
    }
    setTopupLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 space-y-4 sm:space-y-6 w-full">
      {/* Balance Card Section */}
      <div className="pt-1 sm:pt-2">
        <Card className="relative overflow-hidden border-none shadow-lg bg-primary text-primary-foreground min-w-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 size-32 sm:size-40 bg-white rounded-full" />
            <div className="absolute -bottom-16 -left-10 size-40 sm:size-48 bg-white rounded-full" />
          </div>
          <CardContent className="p-4 sm:p-8 relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="min-w-0">
                <p className="text-primary-foreground/70 text-[10px] sm:text-xs mt-3 font-semibold uppercase tracking-wider mb-1">
                  Available Balance
                </p>
                {isLoading ? (
                  <div className="h-8 sm:h-10 w-24 sm:w-28 bg-white/20 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-2xl sm:text-5xl font-black tracking-tight truncate">
                    ₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="size-10 sm:size-14 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon icon="solar:wallet-bold-duotone" className="size-5 sm:size-8" />
              </div>
            </div>
            
            <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`size-2 rounded-full ${wallet?.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                />
                <p className="text-primary-foreground/80 text-[11px] sm:text-xs font-medium">
                  {wallet?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <Button
                onClick={() => setIsTopupOpen(true)}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground font-bold px-3 sm:px-4 h-8 sm:h-9 text-[10px] sm:text-xs shadow-sm rounded-lg whitespace-nowrap transition-colors border border-primary-foreground/10"
              >
                <Icon icon="solar:add-circle-bold" className="size-3.5 sm:size-4 mr-1 sm:mr-1.5" />
                Add Money
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-xl font-bold font-heading">Add Money</DialogTitle>
            <DialogDescription className="sr-only">Top up your wallet balance</DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Select Amount</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={topupAmount === amt && !customAmount ? 'default' : 'outline'}
                    className={`h-12 rounded-xl transition-all ${
                      topupAmount === amt && !customAmount
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:border-primary/50 hover:text-primary'
                    }`}
                    onClick={() => {
                      setTopupAmount(amt);
                      setCustomAmount('');
                    }}
                  >
                    ₹{amt}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Or enter custom amount
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  ₹
                </span>
                <Input
                  type="number"
                  className="pl-8 h-12 bg-muted/20 border-border rounded-xl font-semibold focus:ring-primary/20"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Minimum ₹100"
                />
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-md transition-all"
              onClick={handleTopup}
              disabled={topupLoading || effectiveAmount < 100}
            >
              {topupLoading ? (
                <Icon icon="solar:spinner-bold" className="size-6 animate-spin mr-2" />
              ) : (
                <Icon icon="solar:card-send-bold" className="size-6 mr-2" />
              )}
              {topupLoading
                ? 'Processing...'
                : `Top-Up ₹${effectiveAmount.toLocaleString('en-IN')}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-bold text-lg sm:text-xl font-heading">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5 text-xs sm:text-sm px-2 sm:px-3 h-8">
            View All
          </Button>
        </div>
        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-6">
                    <div className="size-12 rounded-2xl bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 text-center">
                <div className="size-16 sm:size-20 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                  <Icon icon="solar:wallet-broken" className="size-8 sm:size-10 opacity-20" />
                </div>
                <h4 className="font-semibold text-base sm:text-lg text-foreground">No Transactions Yet</h4>
                <p className="text-muted-foreground text-sm max-w-xs mt-1">
                  Start using your wallet to see your transaction history here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {transactions.map((tx, idx) => (
                  <TransactionRow key={tx.id ?? idx} tx={tx} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
