import { UI_CONSTANTS } from '@/common/constants/ui.constants';

export interface StylistListItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  specialization: string;
  experience: number;
  status: 'ACTIVE' | 'INACTIVE';
  userStatus: (typeof UI_CONSTANTS.STYLIST.USER_STATUS)[keyof typeof UI_CONSTANTS.STYLIST.USER_STATUS];
  inviteStatus?: (typeof UI_CONSTANTS.STYLIST.STATUS)[keyof typeof UI_CONSTANTS.STYLIST.STATUS];
  inviteExpiresAt?: string;
  inviteLink?: string;
  isBlocked: boolean;
}

export type CreateInvitePayload = {
  email: string;
  specialization: string;
  experience: number;
};

export type ValidateInviteResponse = {
  email: string;
  specialization: string;
  experience: number;
  expiresAt: string;
};

export type AcceptInvitePayload = {
  name: string;
  phone?: string;
  password: string;
};

export type ApplyAsStylistPayload = {
  email: string;
  specialization: string;
  experience: number;
};

export type InvitePreview = {
  email: string;
  specialization: string;
  experience: number;
  expiresAt: string;
};

export interface StylistInviteState {
  stylists: StylistListItem[];
  loading: boolean;
  error: string | null;
  inviteLink: string | null;
  invitePreview: InvitePreview | null;
  acceptSuccess: boolean;
}
