import { api } from './api';

export type CreateInvitePayload = {
  email: string;
  branchId?: string;
  specialization: string;
  experience: number;
};

export type ValidateInviteResponse = {
  email: string;
  branchId?: string;
  specialization: string;
  experience: number;
  expiresAt: string;
};

export type StylistListItem = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  specialization: string;
  experience: number;
  status: 'ACTIVE' | 'INACTIVE';
  userStatus: 'APPLIED' | 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';
  inviteStatus?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  inviteExpiresAt?: string;
  inviteLink?: string;
  isBlocked: boolean;
};

export type ApplyAsStylistPayload = {
  email: string;
  specialization: string;
  experience: number;
};

export type AcceptInvitePayload = {
  name: string;
  phone?: string;
  password: string;
};

export const stylistInviteService = {
  createInvite(data: CreateInvitePayload) {
    return api.post<{ data: { inviteLink: string; userId: string } }>(
      '/admin/stylists/invite',
      data,
    );
  },

  listStylists() {
    return api.get<{ data: StylistListItem[] }>('/admin/stylists');
  },

  validate(token: string) {
    return api.get<{ data: ValidateInviteResponse }>(`/stylists/invite/${token}`);
  },

  accept(token: string, data: AcceptInvitePayload) {
    return api.post<{ success: true }>(`/stylists/invite/${token}/accept`, data);
  },

  approve(userId: string) {
    return api.post<{ success: true }>(`/admin/stylists/${userId}/approve`);
  },

  reject(userId: string) {
    return api.post<{ success: true }>(`/admin/stylists/${userId}/reject`);
  },

  sendInviteToApplied(userId: string) {
    return api.post(`/admin/stylists/${userId}/send-invite`);
  },

  toggleBlock(userId: string, block: boolean) {
    return api.post<{ success: true }>(`/admin/stylists/${userId}/block`, { block });
  },

  applyAsStylist(data: ApplyAsStylistPayload) {
    return api.post<{ message: string }>('/apply-stylist', data);
  },
};
