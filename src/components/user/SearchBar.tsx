// src/components/SearchBar.tsx
'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  return (
    <section className="py-8 bg-card border-y border-border">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="block mb-2 text-sm">Select Salon</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Location 1</SelectItem>
                <SelectItem value="2">Location 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="block mb-2 text-sm">Service Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Hair Cut</SelectItem>
                <SelectItem value="2">Hair Coloring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="block mb-2 text-sm">Date</Label>
            <Input type="date" />
          </div>
          <Button
            size="lg"
            className="min-w-[140px] shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
          >
            Search Now
          </Button>
        </div>
      </div>
    </section>
  );
}
