import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WeeklyRoutine from '@/components/schedule/WeeklyRoutine';
import DailyAdjustments from '@/components/schedule/DailyAdjustments';
import BreakManagement from '@/components/schedule/BreakManagement';

export default function StylistSchedulePage() {
  return (
    <div className="space-y-6 rounded-lg bg-muted/30 border border-border/40 transition-all hover:shadow-md p-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-muted-foreground">
          Manage your weekly routine and specific daily adjustments.
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Routine</TabsTrigger>
          <TabsTrigger value="daily">Daily Adjustments</TabsTrigger>
          <TabsTrigger value="breaks">Break Times</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Work Week</CardTitle>
              <CardDescription>
                Set your default working hours for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyRoutine />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specific Date Overrides</CardTitle>
              <CardDescription>
                Adjust your hours for specific dates (holidays, personal adjustments).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyAdjustments />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="breaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Break Management</CardTitle>
              <CardDescription>
                Manage your recurring weekly breaks and specific date breaks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreakManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
