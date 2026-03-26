import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import WeeklyRoutine from '@/components/schedule/WeeklyRoutine';
import DailyAdjustments from '@/components/schedule/DailyAdjustments';
import BreakManagement from '@/components/schedule/BreakManagement';
import StylistBranchService from '@/services/stylistBranch.service';


interface StylistScheduleManagementProps {
  stylistId: string;
  stylistName: string;
  onClose: () => void;
}

export default function StylistScheduleManagement({
  stylistId,
  stylistName,
  onClose,
}: StylistScheduleManagementProps) {
  const [activeTab, setActiveTab] = useState('weekly');
  const [branchId, setBranchId] = useState<string | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(true);

  // Auto-fetch stylist's branch for the admin
  useEffect(() => {
    const fetchStylistBranch = async () => {
      setIsBranchLoading(true);
      try {
        const response = await StylistBranchService.getStylistBranches(stylistId);

        const branches = response.data.data;
        if (branches.length > 0) {
          const activeBranch = branches.find((b) => b.isActive);
          setBranchId(activeBranch?.branchId || branches[0].branchId);
        }
      } catch (error) {
        console.error('Failed to fetch stylist branch:', error);
      } finally {
        setIsBranchLoading(false);
      }
    };
    fetchStylistBranch();
  }, [stylistId]);

  return (
    <div className="space-y-4">
      <div className="space-y-6 bg-white p-8 border rounded-2xl shadow-sm">
        {/* Component Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100"
            >
              <Icon icon="solar:arrow-left-linear" className="size-8 text-slate-500" />
            </Button>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                <Icon icon="solar:calendar-bold" className="size-6 text-primary/80" />
                Schedule Management
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage weekly routine, daily adjustments, and breaks for{' '}
                <span className="font-semibold text-slate-700">{stylistName}</span>.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="font-semibold px-4 py-1.5 rounded-full text-xs">
            Admin Access
          </Badge>
        </div>

        {isBranchLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Icon icon="eos-icons:loading" className="size-10 animate-spin text-primary/40" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/40">
              Fetching Stylist Branch...
            </p>
          </div>
        ) : !branchId ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-amber-50 rounded-[2.5rem] border border-amber-100 border-dashed">
            <div className="p-5 bg-amber-100 rounded-full shadow-inner">
              <Icon icon="solar:info-circle-bold" className="size-12 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 text-xl uppercase tracking-tight">
                No Branch Assigned
              </h3>
              <p className="text-sm text-amber-600/70 font-medium max-w-[340px] mx-auto mt-1">
                This stylist needs to be assigned to a branch before you can manage their schedule.
              </p>
            </div>
          </div>
        ) : (
          /* Schedule Tabs */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
            <div className="flex items-center justify-center sm:justify-start">
              <TabsList className="bg-slate-50/50 border p-1 rounded-lg">
                <TabsTrigger
                  value="weekly"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 transition-all text-sm font-medium"
                >
                  <Icon icon="solar:calendar-linear" className="mr-2 size-4" />
                  Weekly Routine
                </TabsTrigger>
                <TabsTrigger
                  value="daily"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 transition-all text-sm font-medium"
                >
                  <Icon icon="solar:calendar-date-linear" className="mr-2 size-4" />
                  Daily Overrides
                </TabsTrigger>
                <TabsTrigger
                  value="breaks"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 transition-all text-sm font-medium"
                >
                  <Icon icon="solar:coffee-cup-linear" className="mr-2 size-4" />
                  Break Times
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="weekly" className="mt-6 border-none p-0 focus-visible:ring-0">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <WeeklyRoutine stylistId={stylistId} branchId={branchId} />
              </div>
            </TabsContent>

            <TabsContent value="daily" className="mt-6 border-none p-0 focus-visible:ring-0">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <DailyAdjustments stylistId={stylistId} branchId={branchId} />
              </div>
            </TabsContent>

            <TabsContent value="breaks" className="mt-6 border-none p-0 focus-visible:ring-0">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <BreakManagement stylistId={stylistId} branchId={branchId} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
