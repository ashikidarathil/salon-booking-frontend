'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stylistInviteService } from '@/services/stylistInvite.service';
import { stylistBranchService } from '@/services/stylistBranch.service';
import { branchService } from '@/services/branch.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import WeeklyRoutine from '@/components/schedule/WeeklyRoutine';
import DailyAdjustments from '@/components/schedule/DailyAdjustments';
import { showError } from '@/common/utils/swal.utils';
import type { StylistListItem } from '@/features/stylistInvite/stylistInvite.types';
import type { Branch } from '@/features/branch/branch.types';

export default function StylistDetailPage() {
  const { stylistId } = useParams<{ stylistId: string }>();
  const navigate = useNavigate();
  const [stylist, setStylist] = useState<StylistListItem | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStylistData = async () => {
      if (!stylistId) return;
      try {
        setLoading(true);
        // We need stylist details. Since we don't have getStylistById, we list and find.
        // Or we could have added getStylistById to backend.
        // For now, let's use list and filter.
        const res = await stylistInviteService.listStylists();
        const found = res.data.data.find(s => s.userId === stylistId || s.id === stylistId);
        
        if (!found) {
          showError('Error', 'Stylist not found');
          navigate('/admin/stylists');
          return;
        }
        setStylist(found);

        // Fetch branch assignment. 
        // We need to find which branch this stylist belongs to.
        // Since we don't have a direct "getBranchByStylist" for admin without knowing branchId,
        // we might need to iterate branches or have a better API.
        // But usually, the stylist is already assigned.
        // Let's check if we can get it from branch lists.
        const branchesRes = await branchService.list();
        const branchesList = branchesRes.data.data;
        
        for (const b of branchesList) {
          const stylistsRes = await stylistBranchService.listBranchStylists(b.id);
          const isAssigned = stylistsRes.data.data.find(s => s.stylistId === stylistId);
          if (isAssigned) {
            setBranch(b);
            break;
          }
        }

      } catch (error) {
        showError('Error', 'Failed to load stylist details');
      } finally {
        setLoading(false);
      }
    };

    fetchStylistData();
  }, [stylistId, navigate]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!stylist) return <div className="p-8">Stylist not found</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/stylists')}>
          <Icon icon="solar:arrow-left-bold" className="mr-2" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{stylist.name || 'Stylist Details'}</h1>
          <p className="text-muted-foreground">{stylist.email}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">{stylist.specialization}</Badge>
            <Badge variant="outline">{stylist.experience} Years Experience</Badge>
            {branch && <Badge className="bg-primary/10 text-primary border-primary/20">Branch: {branch.name}</Badge>}
          </div>
        </div>
        
        <div className="flex gap-2">
           {/* Add actions like Block/Unblock here if needed */}
        </div>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="weekly">Weekly Routine</TabsTrigger>
          <TabsTrigger value="daily">Daily Adjustments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Weekly Routine</CardTitle>
            </CardHeader>
            <CardContent>
              {branch ? (
                <WeeklyRoutine stylistId={stylist.userId} branchId={branch.id} />
              ) : (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Stylist is not assigned to any branch. Assign a branch to manage their schedule.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
               {branch ? (
                <DailyAdjustments stylistId={stylist.userId} branchId={branch.id} />
              ) : (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  Stylist is not assigned to any branch.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
