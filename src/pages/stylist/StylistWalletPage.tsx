import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistWallet } from '@/features/stylistWallet/stylistWallet.thunks';
import { fetchStylistEscrows, fetchHeldBalance } from '@/features/escrow/escrow.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Clock, Search, RefreshCw } from 'lucide-react';
import Pagination from '@/components/pagination/Pagination';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';
import { EscrowStatus } from '@/features/escrow/escrow.types';

export default function StylistWalletPage() {
  const dispatch = useAppDispatch();
  const { wallet, loading: walletLoading } = useAppSelector((s) => s.stylistWallet);
  const {
    escrows,
    heldBalance,
    pagination,
    loading: escrowLoading,
  } = useAppSelector((s) => s.escrow);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);

  const loadData = useCallback(() => {
    dispatch(fetchStylistWallet());
    dispatch(fetchHeldBalance());
    dispatch(fetchStylistEscrows({ page, limit: 10, search: debouncedSearchTerm }));
  }, [dispatch, page, debouncedSearchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.HELD:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case EscrowStatus.RELEASED:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (walletLoading && !wallet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 space-y-8 rounded-2xl bg-muted/30 border border-border/40 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">My Wallet</h1>
          <p className="text-muted-foreground text-sm mt-2 font-normal">
            Track your earnings and automated payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 px-5 border-border/60 hover:bg-background" onClick={handleRefresh}>
            <RefreshCw className={`size-4 ${escrowLoading ? 'animate-spin' : ''} text-primary`} />
            <span className="font-medium">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/40 shadow-xl bg-background h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Wallet className="size-24 -mr-8 -mt-8" />
            </div>
            <CardContent className="p-8 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <Wallet className="size-5" />
                </div>
                <p className="text-sm font-semibold text-foreground/80">Available Balance</p>
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground">
                ₹{wallet?.withdrawableBalance?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <div className="mt-6 pt-4 border-t border-border/10">
                <p className="text-xs font-medium text-muted-foreground italic flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                  Cleared funds in your wallet
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/40 shadow-xl bg-background h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Clock className="size-24 -mr-8 -mt-8 text-amber-500" />
            </div>
            <CardContent className="p-8 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                   <Clock className="size-5" />
                </div>
                <p className="text-sm font-semibold text-foreground/80">Held Money (Escrow)</p>
              </div>
              <p className="text-4xl font-bold tracking-tight text-foreground">
                ₹{heldBalance?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <div className="mt-6 pt-4 border-t border-border/10">
                <p className="text-xs font-medium text-muted-foreground italic flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Releases every 2 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="border-border/40 shadow-xl bg-background h-full overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <TrendingUp className="size-24 -mr-8 -mt-8 text-muted-foreground" />
            </div>
            <CardContent className="p-8 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                   <TrendingUp className="size-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Lifetime Earnings</p>
              </div>
              <p className="text-4xl font-bold text-foreground tracking-tight">
                ₹{wallet?.totalEarnings?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <div className="mt-6 pt-4 border-t border-border/10">
                <p className="text-xs font-medium text-muted-foreground italic">Total revenue generated</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Held Money Transactions */}
      <Card className="border-border/40 shadow-xl overflow-hidden rounded-3xl">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-6 border-b bg-muted/10 p-6 md:p-8">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Escrow Transactions</CardTitle>
            <p className="text-sm font-medium text-muted-foreground/60 mt-1">
              Detailed list of all held and released funds
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              placeholder="Search booking ID..."
              className="pl-11 h-12 rounded-2xl border-border/40 bg-background shadow-inner focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground/60 font-semibold text-left border-b border-border/30">
                <tr>
                  <th className="px-8 py-4 text-[11px]">Booking Details</th>
                  <th className="px-8 py-4 text-[11px]">Amount</th>
                  <th className="px-8 py-4 text-[11px]">Release Date</th>
                  <th className="px-8 py-4 text-[11px]">Status</th>
                  <th className="px-8 py-4 text-[11px]">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {escrowLoading && escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4 opacity-20"></div>
                      <span className="font-medium text-xs opacity-40">Syncing data...</span>
                    </td>
                  </tr>
                ) : escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">
                       <div className="size-16 rounded-3xl bg-muted/50 flex flex-col items-center justify-center mx-auto mb-4 border border-border/10 opacity-30">
                          <Search className="size-8" />
                       </div>
                       <p className="font-medium opacity-30 text-xs">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  escrows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">
                          #{row.bookingId?.bookingNumber || 'N/A'}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground/50">
                          {row.bookingId?.items?.[0]?.serviceId?.name || 'Service'}
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-foreground text-base">
                        ₹{row.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-8 py-6">
                        <Badge
                          variant="secondary"
                          className="gap-2 font-medium px-3 py-1 rounded-xl bg-background border border-border/10 shadow-sm text-[10px]"
                        >
                          <Clock className="size-3 text-primary/70" />
                          {row.releaseDate}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`${getStatusColor(row.status)} border py-1 px-4 rounded-xl shadow-none text-[10px] font-bold`}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-muted-foreground font-medium text-[11px]">
                        {format(new Date(row.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-border/20">
             {escrows.map((row) => (
                <div key={row.id} className="p-6 space-y-5 bg-background hover:bg-muted/5 transition-colors">
                   <div className="flex items-start justify-between">
                      <div className="space-y-1">
                         <div className="font-bold text-lg text-foreground tracking-tight">#{row.bookingId?.bookingNumber || 'N/A'}</div>
                         <div className="text-[10px] font-medium text-muted-foreground/60">
                            {row.bookingId?.items?.[0]?.serviceId?.name || 'General Service'}
                         </div>
                      </div>
                      <Badge className={`${getStatusColor(row.status)} border py-1 px-3 rounded-lg shadow-none text-[10px] font-bold`}>
                         {row.status}
                      </Badge>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/10">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-medium text-muted-foreground/50 tracking-wide">Earnings</span>
                         <span className="text-xl font-bold text-primary">₹{row.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-medium text-muted-foreground/50 tracking-wide">Release Date</span>
                         <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="size-3 text-amber-500" />
                            <span className="text-xs font-bold text-foreground tracking-tight">{row.releaseDate}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center justify-center text-[10px] font-medium text-muted-foreground/30 pt-2">
                       {format(new Date(row.createdAt), 'dd MMM yyyy • hh:mm a')}
                   </div>
                </div>
             ))}
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-border/10">
            <Pagination
              currentPage={pagination?.page || 1}
              totalPages={pagination?.pages || 0}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
