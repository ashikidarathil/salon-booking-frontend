export interface BranchServiceItem {
  branchId: string;
  serviceId: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  duration: number;
  imageUrl?: string;
  description?: string;
  whatIncluded?: string[];
  isActive: boolean;
  configured: boolean;
}
