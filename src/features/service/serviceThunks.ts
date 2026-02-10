import { createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '@/services/service.service';
import type { Service, ServiceStatus } from './service.types';
import { handleThunkError } from '@/common/utils/thunk.utils';
import { ERROR_MESSAGES } from '@/common/constants/error.messages';

/* =========================
   FETCH (ADMIN)
========================= */
export const fetchServices = createAsyncThunk<
  Service[],
  { includeDeleted?: boolean } | undefined,
  { rejectValue: string }
>('service/fetchServices', async (payload, { rejectWithValue }) => {
  try {
    const res = await serviceService.adminList(payload?.includeDeleted);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchPaginatedServices = createAsyncThunk<
  {
    data: Service[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  },
  {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    categoryId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isDeleted?: boolean;
  },
  { rejectValue: string }
>('service/fetchPaginatedServices', async (params, { rejectWithValue }) => {
  try {
    const res = await serviceService.getPaginatedServices(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

/* =========================
   CREATE
========================= */
export const createService = createAsyncThunk<
  Service,
  {
    name: string;
    description?: string;
    categoryId: string;
    status?: ServiceStatus;
    whatIncluded?: string[];
  },
  { rejectValue: string }
>('service/createService', async (data, { rejectWithValue }) => {
  try {
    const res = await serviceService.create(data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.CREATE_FAILED);
  }
});

/* =========================
   UPDATE
========================= */
export const updateService = createAsyncThunk<
  Service,
  {
    id: string;
    data: Partial<{
      name: string;
      description?: string;
      status: ServiceStatus;
      imageUrl: string;
    }>;
  },
  { rejectValue: string }
>('service/updateService', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await serviceService.update(id, data);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

/* =========================
   TOGGLE STATUS
========================= */
export const toggleServiceStatus = createAsyncThunk<
  Service,
  { id: string; status: ServiceStatus },
  { rejectValue: string }
>('service/toggleServiceStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await serviceService.update(id, { status });
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPDATE_FAILED);
  }
});

/* =========================
   UPLOAD IMAGE
========================= */
export const uploadServiceImage = createAsyncThunk<
  Service,
  { serviceId: string; file: File },
  { rejectValue: string }
>('service/uploadServiceImage', async ({ serviceId, file }, { rejectWithValue }) => {
  try {
    const res = await serviceService.uploadImage(serviceId, file);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.UPLOAD_PICTURE_FAILED);
  }
});

/* =========================
   DELETE IMAGE
========================= */
export const deleteServiceImage = createAsyncThunk<Service, string, { rejectValue: string }>(
  'service/deleteServiceImage',
  async (serviceId, { rejectWithValue }) => {
    try {
      const res = await serviceService.deleteImage(serviceId);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DELETE_FAILED);
    }
  },
);

/* =========================
   SOFT DELETE
========================= */
export const softDeleteService = createAsyncThunk<Service, string, { rejectValue: string }>(
  'service/softDeleteService',
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceService.softDelete(id);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DELETE_FAILED);
    }
  },
);

/* =========================
   RESTORE
========================= */
export const restoreService = createAsyncThunk<Service, string, { rejectValue: string }>(
  'service/restoreService',
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceService.restore(id);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.OPERATION_FAILED);
    }
  },
);

export const fetchPublicServicesPaginated = createAsyncThunk<
  {
    data: Service[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  },
  {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  },
  { rejectValue: string }
>('service/fetchPublicServicesPaginated', async (params, { rejectWithValue }) => {
  try {
    const res = await serviceService.listPublicPaginated(params);
    return res.data.data;
  } catch (err) {
    return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
  }
});

export const fetchPublicServiceDetails = createAsyncThunk<Service, string, { rejectValue: string }>(
  'service/fetchPublicServiceDetails',
  async (id, { rejectWithValue }) => {
    try {
      const res = await serviceService.getPublic(id);
      return res.data.data;
    } catch (err) {
      return handleThunkError(err, rejectWithValue, ERROR_MESSAGES.DATA_LOAD_FAILED);
    }
  },
);
