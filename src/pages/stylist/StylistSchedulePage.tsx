import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WeeklyRoutine from '@/components/schedule/WeeklyRoutine';
import DailyAdjustments from '@/components/schedule/DailyAdjustments';
import BreakManagement from '@/components/schedule/BreakManagement';

export default function StylistSchedulePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 px-4 sm:px-6 theme-stylist">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90 font-outfit">My Schedule</h2>
        <p className="text-sm font-medium text-muted-foreground/60">
          Manage your weekly routine, specific daily adjustments, and scheduled breaks.
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <div className="bg-muted/50 p-1 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar border border-border/20 shadow-sm">
          <TabsList className="bg-transparent h-10 w-full md:w-fit flex md:inline-flex gap-1">
            <TabsTrigger
              value="weekly"
              className="flex-1 md:flex-none rounded-xl px-4 sm:px-6 h-8 text-[11px] sm:text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
            >
              Weekly Routine
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="flex-1 md:flex-none rounded-xl px-4 sm:px-6 h-8 text-[11px] sm:text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
            >
              Daily Adjustments
            </TabsTrigger>
            <TabsTrigger
              value="breaks"
              className="flex-1 md:flex-none rounded-xl px-4 sm:px-6 h-8 text-[11px] sm:text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all whitespace-nowrap"
            >
              Break Times
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly" className="space-y-4 animate-in fade-in duration-300">
          <WeeklyRoutine />
        </TabsContent>

        <TabsContent value="daily" className="space-y-4 animate-in fade-in duration-300">
          <DailyAdjustments />
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4 animate-in fade-in duration-300">
          <BreakManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
