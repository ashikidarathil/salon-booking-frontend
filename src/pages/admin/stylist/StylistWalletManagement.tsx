import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchStylistWalletById } from '@/features/stylistWallet/stylistWallet.thunks';
import { fetchAdminStylistEscrows, fetchAdminStylistHeldBalance } from '@/features/escrow/escrow.thunks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Clock, Loader2, Info, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EscrowStatus } from '@/features/escrow/escrow.types';

interface StylistWalletManagementProps {
  stylistId: string;
}

export default function StylistWalletManagement({ stylistId }: StylistWalletManagementProps) {
  const dispatch = useAppDispatch();
  const { selectedStylistWallet: wallet, loading: walletLoading } = useAppSelector((s) => s.stylistWallet);
  const { escrows, heldBalance, pagination, loading: escrowLoading } = useAppSelector((s) => s.escrow);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchStylistWalletById(stylistId));
    dispatch(fetchAdminStylistHeldBalance(stylistId));
    dispatch(fetchAdminStylistEscrows({ stylistId, query: { page, limit: 10, search: searchTerm } }));
  }, [dispatch, stylistId, page, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(fetchStylistWalletById(stylistId));
    dispatch(fetchAdminStylistHeldBalance(stylistId));
    dispatch(fetchAdminStylistEscrows({ stylistId, query: { page, limit: 10, search: searchTerm } }));
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.HELD: return 'bg-amber-100 text-amber-700 border-amber-200';
      case EscrowStatus.RELEASED: return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-md bg-primary text-primary-foreground pt-5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Wallet className="size-4" />
                <p className="text-xs font-medium">Withdrawable Balance</p>
              </div>
              <p className="text-3xl font-bold">₹{wallet?.withdrawableBalance?.toFixed(2) ?? '0.00'}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-none shadow-md bg-amber-500 text-black pt-5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Clock className="size-4" />
                <p className="text-xs font-medium">Held Money (Escrow)</p>
              </div>
              <p className="text-3xl font-bold">₹{heldBalance?.toFixed(2) ?? '0.00'}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-md bg-muted/60 pt-5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <TrendingUp className="size-4" />
                <p className="text-xs font-medium">Lifetime Earnings</p>
              </div>
              <p className="text-3xl font-bold">₹{wallet?.totalEarnings?.toFixed(2) ?? '0.00'}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Escrow Transactions */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b bg-muted/20 pb-4">
          <div>
            <CardTitle className="text-sm font-bold">Escrow Transactions</CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">Detailed list of all held and released funds</p>
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
                        <div className="font-bold text-foreground">#{row.bookingId?.bookingNumber || 'N/A'}</div>
                        <div className="text-[10px] text-muted-foreground opacity-70">
                          {row.bookingId?.items?.[0]?.serviceId?.name || 'Service'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">₹{row.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="gap-1 font-normal text-[10px] h-5">
                          <Clock className="size-2.5" />
                          {row.releaseMonth}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(row.status)} border shadow-none text-[10px] h-5`}>
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
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Policy */}
      <Card className="border-border/60">
        <CardHeader className="py-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Info className="size-3.5 text-primary" />
            Payout Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pt-0 space-y-3">
          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex gap-3 items-start">
            <Clock className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-800 leading-relaxed">
              <p className="font-bold mb-0.5">Automated Monthly Payouts</p>
              <p>
                Earnings are released <strong>automatically</strong> to the stylist's wallet on the <strong>1st of every month</strong>.
              </p>
            </div>
          </div>
          
   
        </CardContent>
      </Card>
    </div>
  );
}
