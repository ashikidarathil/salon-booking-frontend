import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import { buildUrl } from '@/common/utils/api.utils';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  Service,
  ServiceStatus,
  ServiceQuery,
  PaginatedServiceResponse,
} from '@/features/service/service.types';

export type CreateServiceInput = {
  name: string;
  description?: string;
  categoryId: string;
  imageUrl?: string;
  status?: ServiceStatus;
  whatIncluded?: string[];
};

export const serviceService = {
  publicList() {
    return api.get<ApiResponse<Service[]>>(API_ROUTES.SERVICE.PUBLIC_LIST);
  },

  adminList(includeDeleted = false) {
    return api.get<ApiResponse<Service[]>>(API_ROUTES.SERVICE.ADMIN_LIST, {
      params: { includeDeleted },
    });
  },

  getPaginatedServices(params?: ServiceQuery) {
    return api.get<ApiResponse<PaginatedServiceResponse>>(API_ROUTES.SERVICE.PAGINATED, {
      params,
    });
  },

  create(data: CreateServiceInput) {
    const payload = {
      ...data,
      status: data.status ?? 'ACTIVE',
    };

    return api.post<ApiResponse<Service>>(API_ROUTES.SERVICE.CREATE, payload);
  },

  update(id: string, data: Partial<Service>) {
    const url = buildUrl(API_ROUTES.SERVICE.UPDATE, { id });
    return api.patch<ApiResponse<Service>>(url, data);
  },

  softDelete(id: string) {
    const url = buildUrl(API_ROUTES.SERVICE.SOFT_DELETE, { id });
    return api.patch<ApiResponse<Service>>(url);
  },

  restore(id: string) {
    const url = buildUrl(API_ROUTES.SERVICE.RESTORE, { id });
    return api.patch<ApiResponse<Service>>(url);
  },

  uploadImage(serviceId: string, file: File) {
    const url = buildUrl(API_ROUTES.SERVICE.UPLOAD_IMAGE, { id: serviceId });
    const formData = new FormData();
    formData.append('image', file);

    return api.post<ApiResponse<Service>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage(serviceId: string) {
    const url = buildUrl(API_ROUTES.SERVICE.DELETE_IMAGE, { id: serviceId });
    return api.delete<ApiResponse<Service>>(url);
  },

  async getPublic(id: string) {
    return api.get<ApiResponse<Service>>(API_ROUTES.SERVICE.PUBLIC_BY_ID(id));
  },

  async listPublicPaginated(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    return api.get<ApiResponse<PaginatedServiceResponse>>(API_ROUTES.SERVICE.PUBLIC_PAGINATED, {
      params,
    });
  },
};
