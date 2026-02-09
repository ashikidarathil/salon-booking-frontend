export interface BranchStylist {
  mappingId: string;
  branchId: string;
  stylistId: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  experience: number;
  stylistStatus: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
}

export interface UnassignedStylist {
  stylistId: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  experience: number;
  stylistStatus: 'ACTIVE' | 'INACTIVE';
}
