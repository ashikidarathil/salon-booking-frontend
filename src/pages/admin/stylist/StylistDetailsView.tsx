'use client';

import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icon } from '@iconify/react';
import { stylistBranchService } from '@/services/stylistBranch.service';
import { branchService } from '@/services/branch.service';
import StylistServiceManagement from './StylistServiceManagement';
import StylistScheduleManagement from './StylistScheduleManagement';
import OffDayManagement from './OffDayManagementPage';
import type { StylistListItem } from '@/features/stylistInvite/stylistInvite.types';
import type { Branch } from '@/features/branch/branch.types';

interface StylistDetailsViewProps {
  stylist: StylistListItem;
  onClose: () => void;
}

export default function StylistDetailsView({ stylist, onClose }: StylistDetailsViewProps) {
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await stylistBranchService.getStylistBranches(stylist.id);
        if (res.data.data && res.data.data.length > 0) {
          const branchId = res.data.data[0].branchId;
          const branchRes = await branchService.list();
          const found = branchRes.data.data.find((b: Branch) => b.id === branchId);
          if (found) {
            // Found branch
          }
        }
      } catch (error) {
        console.error('Failed to fetch branch info', error);
      } finally {
        // done
      }
    };

    fetchBranch();
  }, [stylist.id]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      {/* <div className="bg-white p-8 border-2 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full hover:bg-slate-100 shrink-0"
            >
              <Icon icon="solar:arrow-left-linear" className="size-6 text-slate-500" />
            </Button>
            
            <div className="flex items-center gap-5">
              <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <Icon icon="solar:user-bold" className="size-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                  {stylist.name || 'Stylist Profile'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                    <Icon icon="solar:letter-bold" className="size-4 opacity-40" />
                    {stylist.email}
                  </span>
                  <div className="size-1 bg-slate-300 rounded-full" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Icon icon="solar:medal-star-bold" className="size-4" />
                    {stylist.position}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="px-4 py-1.5 rounded-xl font-medium text-xs bg-slate-100 text-slate-600 border-none">
              {stylist.experience} Years Exp
            </Badge>
            <Badge className="px-4 py-1.5 rounded-xl font-semibold text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {stylist.specialization}
            </Badge>
            {branch && (
              <Badge variant="outline" className="px-4 py-1.5 rounded-xl font-medium text-xs border-primary/30 text-primary bg-primary/5">
                <Icon icon="solar:shop-bold" className="mr-1.5 size-4" />
                {branch.name}
              </Badge>
            )}
          </div>
        </div>
      </div> */}

      {/* Unified Management Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="bg-slate-50/50 border p-1 rounded-xl w-full md:w-auto overflow-x-auto justify-start inline-flex">
          <TabsTrigger
            value="schedule"
            className="rounded-lg px-8 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <Icon icon="solar:clock-circle-linear" className="mr-2 size-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="rounded-lg px-8 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <Icon icon="solar:scissors-square-linear" className="mr-2 size-4" />
            Services
          </TabsTrigger>
          <TabsTrigger
            value="off-days"
            className="rounded-lg px-8 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <Icon icon="solar:calendar-linear" className="mr-2 size-4" />
            Off-Days
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-0 outline-none">
          <StylistScheduleManagement
            stylistId={stylist.id}
            stylistName={stylist.name}
            onClose={onClose}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-0 outline-none">
          <StylistServiceManagement
            stylistId={stylist.id}
            stylistName={stylist.name}
            onClose={onClose}
          />
        </TabsContent>

        <TabsContent value="off-days" className="mt-0 outline-none">
          <OffDayManagement stylistId={stylist.id} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
