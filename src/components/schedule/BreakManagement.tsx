import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { scheduleService } from '@/services/schedule.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { stylistBranchService } from '@/services/stylistBranch.service';
import type { StylistBreak, CreateStylistBreakDto } from '../schedule.types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BreakManagement({ stylistId: propStylistId, branchId: propBranchId }: { stylistId?: string; branchId?: string }) {
  const { user } = useAppSelector((state) => state.auth);
  const [breaks, setBreaks] = useState<StylistBreak[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedBranchId, setFetchedBranchId] = useState<string | null>(null);

  const effectiveStylistId = propStylistId || user?.id;
  const effectiveBranchId = propBranchId || user?.branchId || fetchedBranchId;

  const [newBreak, setNewBreak] = useState<Partial<CreateStylistBreakDto>>({
    startTime: '13:00',
    endTime: '14:00',
    dayOfWeek: 1,
    description: 'Lunch Break',
  });

  const [activeTab, setActiveTab] = useState<'recurring' | 'one-off'>('recurring');

  useEffect(() => {
    const fetchStylistBranch = async () => {
      if (!propBranchId && !user?.branchId && effectiveStylistId && user?.role === 'STYLIST') {
        try {
          const response = await stylistBranchService.getStylistBranches(effectiveStylistId);
          const branches = response.data.data;
          if (branches.length > 0) {
            const activeBranch = branches.find((b: any) => b.isActive);
            setFetchedBranchId(activeBranch?.branchId || branches[0].branchId);
          }
        } catch (error) {
          console.error('Failed to fetch stylist branch:', error);
        }
      }
    };
    fetchStylistBranch();
  }, [propBranchId, user?.branchId, effectiveStylistId, user?.role]);

  const fetchBreaks = async () => {
    if (!effectiveStylistId || !effectiveBranchId) return;
    setLoading(true);
    try {
      const response = await scheduleService.getBreaks(effectiveStylistId, effectiveBranchId);
      setBreaks(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch breaks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreaks();
  }, [effectiveStylistId, effectiveBranchId]);

  const handleCreateBreak = async () => {
    if (!effectiveStylistId || !effectiveBranchId) return;
    
    try {
      const payload: CreateStylistBreakDto = {
        stylistId: effectiveStylistId,
        branchId: effectiveBranchId,
        startTime: newBreak.startTime!,
        endTime: newBreak.endTime!,
        description: newBreak.description,
        ...(activeTab === 'recurring' ? { dayOfWeek: newBreak.dayOfWeek } : { date: newBreak.date }),
      };

      await scheduleService.createBreak(payload);
      toast.success('Break added successfully');
      fetchBreaks();
    } catch (error) {
      toast.error('Failed to add break');
    }
  };

  const handleDeleteBreak = async (id: string) => {
    try {
      await scheduleService.deleteBreak(id);
      toast.success('Break deleted');
      fetchBreaks();
    } catch (error) {
      toast.error('Failed to delete break');
    }
  };

  const recurringBreaks = breaks.filter((b) => b.dayOfWeek !== undefined);
  const oneOffBreaks = breaks.filter((b) => b.date !== undefined);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Break</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="one-off">Specific Date</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {activeTab === 'recurring' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day of Week</label>
                  <select
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    value={newBreak.dayOfWeek}
                    onChange={(e) => setNewBreak({ ...newBreak, dayOfWeek: parseInt(e.target.value) })}
                  >
                    {DAYS.map((day, idx) => (
                      <option key={day} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newBreak.date || ''}
                    onChange={(e) => setNewBreak({ ...newBreak, date: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={newBreak.startTime}
                  onChange={(e) => setNewBreak({ ...newBreak, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={newBreak.endTime}
                  onChange={(e) => setNewBreak({ ...newBreak, endTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="e.g. Lunch"
                  value={newBreak.description}
                  onChange={(e) => setNewBreak({ ...newBreak, description: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateBreak} className="w-full" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Break
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recurring Breaks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringBreaks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No recurring breaks defined
                    </TableCell>
                  </TableRow>
                ) : (
                  recurringBreaks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{DAYS[b.dayOfWeek!]}</TableCell>
                      <TableCell>{b.startTime} - {b.endTime}</TableCell>
                      <TableCell>{b.description}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBreak(b.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">One-off Breaks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oneOffBreaks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No specific date breaks defined
                    </TableCell>
                  </TableRow>
                ) : (
                  oneOffBreaks.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{new Date(b.date!).toLocaleDateString()}</TableCell>
                      <TableCell>{b.startTime} - {b.endTime}</TableCell>
                      <TableCell>{b.description}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBreak(b.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
