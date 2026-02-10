import { createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import type { StylistInviteState } from './stylistInvite.types';
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

const initialState: StylistInviteState = {
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
      .addCase(fetchPaginatedStylists.fulfilled, (state, action) => {
        state.stylists = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      // ===== BLOCK/UNBLOCK STYLIST =====
      .addCase(blockUnblockStylist.fulfilled, (state, action) => {
        const { stylistId, isBlocked } = action.payload;
        const stylist = state.stylists.find((s) => s.id === stylistId);
        if (stylist) {
          stylist.isBlocked = isBlocked;
        }
      })

      // ===== FETCH STYLISTS =====
      .addCase(fetchStylists.fulfilled, (state, action) => {
        state.stylists = action.payload;
      })

      // ===== CREATE INVITE =====
      .addCase(createStylistInvite.fulfilled, (state, action) => {
        state.inviteLink = action.payload.inviteLink;
        // Update the stylist in list if it exists
        const stylist = state.stylists.find((s) => s.userId === action.payload.userId);
        if (stylist) {
          stylist.inviteLink = action.payload.inviteLink;
          stylist.inviteStatus = 'PENDING';
        }
      })

      // ===== VALIDATE INVITE =====
      .addCase(validateInvite.fulfilled, (state, action) => {
        state.invitePreview = action.payload;
      })

      // ===== ACCEPT INVITE =====
      .addCase(acceptInvite.fulfilled, (state) => {
        state.acceptSuccess = true;
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

      // ===== TOGGLE BLOCK =====
      .addCase(toggleBlockStylist.fulfilled, (state, action) => {
        const { userId, block } = action.payload;
        const stylist = state.stylists.find((s) => s.userId === userId);
        if (stylist) {
          stylist.isBlocked = block;
        }
      })

      // ===== SEND INVITE TO APPLIED =====
      .addCase(sendInviteToApplied.fulfilled, (state, action) => {
        state.inviteLink = action.payload.inviteLink;
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Something went wrong';
      })
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export const { clearInviteLink } = slice.actions;
export default slice.reducer;
