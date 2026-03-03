import { api } from './api/api';
import { API_ROUTES } from '../common/constants/api.routes';
import type { EscrowResponse } from '../features/escrow/escrow.types';

const EscrowService = {
  getAdminEscrows: async () => {
    return api.get<EscrowResponse[]>(API_ROUTES.ESCROW.ADMIN_LIST);
  },

  getEscrowByBooking: async (bookingId: string) => {
    return api.get<EscrowResponse>(API_ROUTES.ESCROW.BY_BOOKING(bookingId));
  },
};

export default EscrowService;
