import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import stylistInviteReducer from '../features/stylistInvite/stylistInviteSlice';
import profileReducer from '@/features/profile/profileSlice';
import userReducer from '@/features/user/userSlice';
import categoryReducer from '@/features/category/categorySlice';
import serviceReducer from '@/features/service/service.slice';
import branchReducer from '@/features/branch/branch.slice';
import stylistBranchReducer from '@/features/stylistBranch/stylistBranch.slice';
import branchCategoryReducer from '@/features/branchCategory/branchCategory.slice';
import branchServiceReducer from '@/features/branchService/branchService.slice';
import slotReducer from '@/features/slot/slot.slice';
import bookingReducer from '@/features/booking/booking.slice';
import scheduleReducer from '@/features/schedule/schedule.slice';
import offDayReducer from '@/features/offDay/offDay.slice';
import stylistServiceReducer from '@/features/stylistService/stylistService.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stylistInvite: stylistInviteReducer,
    profile: profileReducer,
    user: userReducer,
    category: categoryReducer,
    service: serviceReducer,
    branch: branchReducer,
    stylistBranch: stylistBranchReducer,
    branchCategory: branchCategoryReducer,
    branchService: branchServiceReducer,
    slot: slotReducer,
    booking: bookingReducer,
    schedule: scheduleReducer,
    offDay: offDayReducer,
    stylistService: stylistServiceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
