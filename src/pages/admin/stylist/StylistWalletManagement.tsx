import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistWalletById } from '@/features/stylistWallet/stylistWallet.thunks';
import {
  fetchAdminStylistEscrows,
  fetchAdminStylistHeldBalance,
} from '@/features/escrow/escrow.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wallet,
  TrendingUp,
  Clock,
  Loader2,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EscrowStatus } from '@/features/escrow/escrow.types';
import { useDebounce } from '@/hooks/useDebounce';

interface StylistWalletManagementProps {
  stylistId: string;
}

export default function StylistWalletManagement({ stylistId }: StylistWalletManagementProps) {
  const dispatch = useAppDispatch();
  const { selectedStylistWallet: wallet, loading: walletLoading } = useAppSelector(
    (s) => s.stylistWallet,
  );
  const {
    escrows,
    heldBalance,
    pagination,
    loading: escrowLoading,
  } = useAppSelector((s) => s.escrow);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchStylistWalletById(stylistId));
    dispatch(fetchAdminStylistHeldBalance(stylistId));
    dispatch(
      fetchAdminStylistEscrows({
        stylistId,
        query: { page, limit: 10, search: debouncedSearchTerm },
      }),
    );
  }, [dispatch, stylistId, page, debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(fetchStylistWalletById(stylistId));
    dispatch(fetchAdminStylistHeldBalance(stylistId));
    dispatch(
      fetchAdminStylistEscrows({ stylistId, query: { page, limit: 10, search: searchTerm } }),
    );
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
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin mr-3" />
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <p className="text-xs mt-2 text-muted-foreground italic">Total revenue generated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Escrow Transactions */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b bg-muted/20 pb-4">
          <div>
            <CardTitle className="text-sm font-bold">Escrow Transactions</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Detailed list of all held and released funds
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleRefresh}
            >
              <RefreshCw className={`size-3 ${escrowLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search booking number..."
                className="pl-9 h-8 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-4 py-2.5">Booking Details</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Release Month</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {escrowLoading && escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
                      Loading...
                    </td>
                  </tr>
                ) : escrows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                      No escrow transactions found.
                    </td>
                  </tr>
                ) : (
                  escrows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground">
                          #{row.bookingId?.bookingNumber || 'N/A'}
                        </div>
                        <div className="text-[10px] text-muted-foreground opacity-70">
                          {row.bookingId?.items?.[0]?.serviceId?.name || 'Service'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        ₹{row.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="gap-1 font-normal text-[10px] h-5">
                          <Clock className="size-2.5" />
                          {row.releaseDate}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`${getStatusColor(row.status)} border shadow-none text-[10px] h-5`}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(row.createdAt), 'dd MMM yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="px-4 py-2 flex items-center justify-between border-t bg-muted/5">
              <p className="text-[10px] text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Policy */}
      <Card className="border-none shadow-lg bg-blue-50/50">
        <CardContent className="p-6 flex gap-4 items-start">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <Info className="size-5 text-white" />
          </div>
          <div className="text-sm text-blue-950">
            <p className="font-bold mb-1 font-heading uppercase tracking-tighter">
              Escrow Payout Strategy
            </p>
            <p className="opacity-80 leading-relaxed italic">
              Earnings are released <strong>automatically</strong> to the stylist's wallet every 2
              minutes. You can track all scheduled and past releases here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
