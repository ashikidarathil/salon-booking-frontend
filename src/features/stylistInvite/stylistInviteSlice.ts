// frontend/src/features/stylistInvite/stylistInviteSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { StylistListItem } from './stylistInvite.types';
import {
  createStylistInvite,
  fetchStylists,
  approveStylist,
  rejectStylist,
  toggleBlockStylist,
  validateInvite,
  acceptInvite,
  sendInviteToApplied,
  fetchPaginatedStylists,
  blockUnblockStylist,
} from './stylistInviteThunks';

import type { InvitePreview } from './stylistInvite.types';
import type { PaginationMetadata } from '@/common/types/pagination.metadata';


interface State {
  stylists: StylistListItem[];
  loading: boolean;
  error: string | null;
  inviteLink: string | null;
  invitePreview: InvitePreview | null;
  acceptSuccess: boolean;
  pagination: PaginationMetadata;
}

const initialState: State = {
  stylists: [],
  loading: false,
  error: null,
  inviteLink: null,
  invitePreview: null,
  acceptSuccess: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const slice = createSlice({
  name: 'stylistInvite',
  initialState,
  reducers: {
    clearInviteLink(state) {
      state.inviteLink = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== FETCH PAGINATED STYLISTS =====
      .addCase(fetchPaginatedStylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedStylists.fulfilled, (state, action) => {
        state.loading = false;
        state.stylists = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPaginatedStylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load stylists';
      })

      // ===== BLOCK/UNBLOCK STYLIST =====
      .addCase(blockUnblockStylist.fulfilled, (state, action) => {
        const { stylistId, isBlocked } = action.payload;
        const stylist = state.stylists.find((s) => s.id === stylistId);
        if (stylist) {
          stylist.isBlocked = isBlocked;
        }
      })
      .addCase(blockUnblockStylist.rejected, (state, action) => {
        state.error = action.payload || 'Failed to block/unblock stylist';
      })

      // ===== FETCH STYLISTS =====
      .addCase(fetchStylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStylists.fulfilled, (state, action) => {
        state.loading = false;
        state.stylists = action.payload;
      })
      .addCase(fetchStylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load stylists';
      })

      // ===== CREATE INVITE =====
      .addCase(createStylistInvite.pending, (state) => {
        state.error = null;
      })
      .addCase(createStylistInvite.fulfilled, (state, action) => {
        state.inviteLink = action.payload.inviteLink;
        // Update the stylist in list if it exists
        const stylist = state.stylists.find((s) => s.userId === action.payload.userId);
        if (stylist) {
          stylist.inviteLink = action.payload.inviteLink;
          stylist.inviteStatus = 'PENDING';
        }
      })
      .addCase(createStylistInvite.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create invite';
      })

      // ===== VALIDATE INVITE =====
      .addCase(validateInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateInvite.fulfilled, (state, action) => {
        state.loading = false;
        state.invitePreview = action.payload;
      })
      .addCase(validateInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to validate invite';
      })

      // ===== ACCEPT INVITE =====
      .addCase(acceptInvite.pending, (state) => {
        state.error = null;
      })
      .addCase(acceptInvite.fulfilled, (state) => {
        state.acceptSuccess = true;
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.error = action.payload || 'Failed to accept invite';
      })

      // ===== APPROVE STYLIST =====
      .addCase(approveStylist.fulfilled, (state, action) => {
        const { userId } = action.meta.arg;
        const stylist = state.stylists.find((s) => s.userId === userId);
        if (stylist) {
          stylist.status = 'ACTIVE';
          stylist.userStatus = 'ACTIVE';
        }
      })
      .addCase(approveStylist.rejected, (state, action) => {
        state.error = action.payload || 'Failed to approve';
      })

      // ===== REJECT STYLIST =====
      .addCase(rejectStylist.fulfilled, (state, action) => {
        const { userId } = action.meta.arg;
        const stylist = state.stylists.find((s) => s.userId === userId);
        if (stylist) {
          stylist.status = 'INACTIVE';
          stylist.userStatus = 'REJECTED';
          stylist.isBlocked = true;
        }
      })
      .addCase(rejectStylist.rejected, (state, action) => {
        state.error = action.payload || 'Failed to reject';
      })

      // ===== TOGGLE BLOCK =====
      .addCase(toggleBlockStylist.fulfilled, (state, action) => {
        const { userId, block } = action.payload;
        const stylist = state.stylists.find((s) => s.userId === userId);
        if (stylist) {
          stylist.isBlocked = block;
        }
      })
      .addCase(toggleBlockStylist.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle block';
      })

      // ===== SEND INVITE TO APPLIED =====
      .addCase(sendInviteToApplied.pending, (state) => {
        state.error = null;
      })
      .addCase(sendInviteToApplied.fulfilled, (state, action) => {
        state.inviteLink = action.payload.inviteLink;
      })
      .addCase(sendInviteToApplied.rejected, (state, action) => {
        state.error = action.payload || 'Failed to send invite';
      });
  },
});

export const { clearInviteLink } = slice.actions;
export default slice.reducer;
