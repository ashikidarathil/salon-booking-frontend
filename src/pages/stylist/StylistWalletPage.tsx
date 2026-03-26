import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistWallet } from '@/features/stylistWallet/stylistWallet.thunks';
import { fetchStylistEscrows, fetchHeldBalance } from '@/features/escrow/escrow.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wallet,
  TrendingUp,
  Clock,
  Search,
  RefreshCw,
} from 'lucide-react';
import Pagination from '@/components/pagination/Pagination';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    <div className="max-w-7xl mx-auto p-6 space-y-6 rounded-lg bg-muted/30 border border-border/40 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-heading">My Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your earnings and automated payouts
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh}>
          <RefreshCw className={`size-4 ${escrowLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-lg bg-primary text-primary-foreground h-full pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="size-5 opacity-80" />
                <p className="text-sm font-medium opacity-80">Available Balance</p>
              </div>
              <p className="text-4xl font-bold">
                ₹{wallet?.withdrawableBalance?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <p className="text-xs mt-2 opacity-70 italic">Cleared funds in your wallet</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-none shadow-lg bg-amber-500 text-white h-full pt-5">
            <CardContent className="p-6 text-black">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="size-5 opacity-80" />
                <p className="text-sm font-medium opacity-80">Held Money (Escrow)</p>
              </div>
              <p className="text-4xl font-bold">
                ₹{heldBalance?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <p className="text-xs mt-2 opacity-70 italic">Releases every 2 minutes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-lg bg-muted/60 h-full pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Lifetime Earnings</p>
              </div>
              <p className="text-4xl font-bold text-foreground">
                ₹{wallet?.totalEarnings?.toLocaleString('en-IN') ?? '0.00'}
              </p>
              <p className="text-xs mt-2 text-muted-foreground">Total revenue generated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Held Money Transactions */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b bg-muted/20 pb-4">
          <div>
            <CardTitle className="text-lg font-bold">Escrow Transactions</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed list of all held and released funds
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search booking number..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground font-medium text-left border-b">
                <tr>
                  <th className="px-6 py-3">Booking Details</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Release Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {escrowLoading && escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      Loading transactions...
                    </td>
                  </tr>
                ) : escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No escrow transactions found.
                    </td>
                  </tr>
                ) : (
                  escrows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                          #{row.bookingId?.bookingNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.bookingId?.items?.[0]?.serviceId?.name || 'Service'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        ₹{row.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="gap-1.5 font-medium flex-nowrap whitespace-nowrap"
                        >
                          <Clock className="size-3" />
                          {row.releaseDate}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(row.status)} border shadow-none`}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(row.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pb-6">
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
