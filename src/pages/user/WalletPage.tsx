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
} from '@/components/ui/dialog';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const typeConfig: Record<TransactionType, { icon: string; color: string; bg: string; label: string }> = {
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
    label: 'Debit' 
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

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
      <div
        className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${type.bg}`}
      >
        <Icon icon={type.icon} className={`size-5 ${type.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{tx.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-slate-400">{date}</span>
          {refType && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 ${refType.color}`}
            >
              <Icon icon={refType.icon} className="size-2.5 inline mr-0.5" />
              {refType.label}
            </span>
          )}
        </div>
      </div>
      <p className={`font-bold text-base flex-shrink-0 ${type.color}`}>
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
    try {
      const themeColor = getThemeColorByRole(user?.role);
      await dispatch(topUpWallet({ amount: effectiveAmount, themeColor })).unwrap();
      setCustomAmount('');
      showSuccess('Top-Up Successful!', `₹${effectiveAmount} added to your wallet.`);
      dispatch(fetchTransactionHistory());
    } catch (err: unknown) {
      if (err !== 'DISMISSED') {
        const error = err as string;
        showError('Top-Up Failed', error || 'Payment could not be processed');
      }
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading">My Wallet</h1>
        <p className="text-muted-foreground text-sm">Manage your balance and transaction history</p>
      </div>

      {/* Balance Card Section */}
      <div>
        <Card className="relative overflow-hidden border-none shadow-xl bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10 size-48 bg-white rounded-full" />
            <div className="absolute -bottom-16 -left-10 size-56 bg-white rounded-full" />
          </div>
          <CardContent className="p-8 relative z-10 mt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium mb-1">Available Balance</p>
                {isLoading ? (
                  <div className="h-12 w-36 bg-white/20 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-5xl font-black tracking-tight">
                    ₹{(wallet?.balance ?? 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Icon icon="solar:wallet-bold-duotone" className="size-8" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div
                className={`size-2 rounded-full ${wallet?.isActive ? 'bg-green-300' : 'bg-red-300'}`}
              />
              <p className="text-primary-foreground/80 text-sm">{wallet?.isActive ? 'Active' : 'Inactive'}</p>
              <div className="ml-auto">
                <Button
                  onClick={() => setIsTopupOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 font-bold px-6 shadow-lg transition-all border-none"
                >
                  <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                  Add Money
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-xl font-bold font-heading">Add Money</DialogTitle>
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
              <p className="text-sm font-medium text-muted-foreground mb-2">Or enter custom amount</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
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
              {topupLoading ? 'Processing...' : `Top-Up ₹${effectiveAmount.toLocaleString('en-IN')}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl font-heading">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View All</Button>
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
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Icon icon="solar:wallet-broken" className="size-10 opacity-20" />
                </div>
                <h4 className="font-semibold text-lg text-foreground">No Transactions Yet</h4>
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
