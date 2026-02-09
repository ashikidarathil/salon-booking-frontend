import { api } from './api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import { buildUrl } from '@/common/utils/api.utils';
import type { ApiResponse } from '@/common/types/api.types';
import type { Service, ServiceStatus } from '@/features/service/service.types';

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
    return api.get<ApiResponse<Service[]>>(
      `${API_ROUTES.SERVICE.ADMIN_LIST}?includeDeleted=${includeDeleted}`,
    );
  },

  getPaginatedServices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    categoryId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isDeleted?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isDeleted !== undefined)
      queryParams.append('isDeleted', params.isDeleted.toString());

    return api.get<
      ApiResponse<{
        data: Service[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>
    >(`/admin/services/paginated?${queryParams.toString()}`);
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

  // ✅ NEW: Get single public service
  async getPublic(id: string) {
    return api.get<ApiResponse<Service>>(`/services/${id}`);
  },

  // ✅ NEW: Get paginated public services
  async listPublicPaginated(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

    return api.get<
      ApiResponse<{
        data: Service[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>
    >(`/services/paginated?${queryParams.toString()}`);
  },
};
