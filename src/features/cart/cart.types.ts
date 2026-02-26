export interface CartItem {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  imageUrl?: string;
  stylistId?: string;
  stylistName?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  slotId?: string;
}

export interface CartState {
  items: CartItem[];
  branchId: string | null;
}
