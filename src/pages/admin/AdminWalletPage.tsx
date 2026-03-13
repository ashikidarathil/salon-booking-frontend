import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminEscrows } from '../../features/escrow/escrow.slice';
import { EscrowStatus } from '../../features/escrow/escrow.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DollarSign, Lock, Calendar, CheckCircle, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function AdminWalletPage() {
  const dispatch = useAppDispatch();
  const { escrows, pagination, loading } = useAppSelector((s) => s.escrow);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('escrowed');

  useEffect(() => {
    dispatch(fetchAdminEscrows({ 
      page, 
      limit: 10, 
      search: searchTerm,
      status: activeTab === 'escrowed' ? EscrowStatus.HELD : EscrowStatus.RELEASED
    }));
  }, [dispatch, page, searchTerm, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setPage(1);
  };

  const heldEscrows = (escrows || []).filter((e) => e.status === EscrowStatus.HELD);
  const releasedEscrows = (escrows || []).filter((e) => e.status === EscrowStatus.RELEASED);

  // Note: Since we are using pagination, these totals are ONLY for the current page if calculated here.
  // Ideally, backend should return these totals, but for now we'll just show page-level breakdown
  // or use the global totals if the backend provided them (which it doesn't yet).
  const pageTotalEscrowed = heldEscrows.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-heading">Financial Oversight</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor escrowed funds and monthly releases</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => dispatch(fetchAdminEscrows({ 
            page, 
            limit: 10, 
            search: searchTerm,
            status: activeTab === 'escrowed' ? EscrowStatus.HELD : EscrowStatus.RELEASED
          }))}
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-lg bg-primary text-primary-foreground pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                <Lock className="size-5" />
                <p className="text-sm font-medium">Page Escrow Total</p>
              </div>
              <p className="text-3xl font-bold text-white">₹{pageTotalEscrowed.toLocaleString('en-IN')}</p>
              <p className="text-xs mt-1 opacity-70">Showing current page funds</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-lg bg-muted/60 pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <Calendar className="size-5" />
                <p className="text-sm font-medium">Automatic Release</p>
              </div>
              <p className="text-3xl font-bold">1st Monthly</p>
              <p className="text-xs mt-1 text-muted-foreground">Next release: {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), 'dd MMM yyyy')}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-lg bg-muted/60 pt-5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                <DollarSign className="size-5" />
                <p className="text-sm font-medium">Search Records</p>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <Input 
                  placeholder="Booking #..." 
                  className="h-9 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-9 w-9">
                  <Search className="size-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Escrow Details */}
      <Card>
        <CardHeader className="pb-0 border-b-0">
          <CardTitle className="text-base font-semibold">Funds Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mx-6">
              <TabsTrigger value="escrowed">Escrowed Funds</TabsTrigger>
              <TabsTrigger value="released">Release History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="escrowed" className="mt-4 border-t">
              {loading && escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic">
                  <RefreshCw className="size-8 mx-auto mb-3 animate-spin opacity-30" />
                  <p>Loading escrowed funds...</p>
                </div>
              ) : heldEscrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Lock className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No funds currently in escrow matching your search</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {heldEscrows.map((e) => (
                    <div key={e.id} className="p-6 flex items-start justify-between hover:bg-muted/10 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-primary font-heading">₹{e.amount.toLocaleString('en-IN')}</span>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            #{e.bookingId?.bookingNumber || 'N/A'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-semibold">{e.bookingId?.userId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Stylist:</span>
                            <span className="font-semibold">{e.stylistId?.userId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs col-span-full">
                            <span className="text-muted-foreground">Service:</span>
                            <span className="font-medium">
                              {e.bookingId?.items?.map(i => i?.serviceId?.name).filter(Boolean).join(', ') || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          {/* <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Calendar className="size-3" />
                            Release: {e.releaseMonth}
                          </p> */}
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                            Created: {format(new Date(e.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 uppercase tracking-widest text-[10px] px-3 py-1">
                        HELD
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="released" className="mt-4 border-t">
              {loading && escrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground italic">
                  <RefreshCw className="size-8 mx-auto mb-3 animate-spin opacity-30" />
                  <p>Loading history...</p>
                </div>
              ) : releasedEscrows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <CheckCircle className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No releases found matching your search</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {releasedEscrows.map((e) => (
                    <div key={e.id} className="p-6 flex items-start justify-between hover:bg-muted/10 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xl text-green-600 font-heading">₹{e.amount.toLocaleString('en-IN')}</span>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            #{e.bookingId?.bookingNumber || 'N/A'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-[10px]">C</div>
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-semibold">{e.bookingId.userId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="size-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-[10px]">S</div>
                            <span className="text-muted-foreground">Stylist:</span>
                            <span className="font-semibold">{e.stylistId?.userId?.name || 'N/A'}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle className="size-3" />
                          Released in {e.releaseMonth}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase tracking-widest text-[10px] px-3 py-1">
                        RELEASED
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t bg-muted/10">
              <p className="text-xs text-muted-foreground font-medium">
                Showing page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 flex items-center gap-1 px-3" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="size-4" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 flex items-center gap-1 px-3"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start shadow-sm">
        <div className="bg-blue-600 p-2 rounded-lg shrink-0">
          <Info className="size-5 text-white" />
        </div>
        <div className="text-sm text-blue-900">
          <p className="font-bold mb-1 font-heading uppercase tracking-tighter">Escrow Payout Strategy</p>
          <p className="opacity-80">Funds are held securely by the platform until the 1st of every month. On release day, our system automatically moves these funds to each stylist's available wallet balance. You can track all scheduled and past releases here.</p>
        </div>
      </div> */}
    </div>
  );
}

