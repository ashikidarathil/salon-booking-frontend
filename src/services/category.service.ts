import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type { Category } from '@/features/category/category.types';

export const categoryService = {
  listCategories(includeDeleted = false) {
    const qs = includeDeleted ? '?includeDeleted=true' : '';
    return api.get<ApiResponse<Category[]>>(`${API_ROUTES.CATEGORY.ADMIN_LIST}${qs}`);
  },

  createCategory(data: { name: string; description?: string }) {
    return api.post<ApiResponse<Category>>(API_ROUTES.CATEGORY.CREATE, data);
  },

  updateCategory(
    id: string,
    data: Partial<{ name: string; description?: string; status?: string }>,
  ) {
    return api.patch<ApiResponse<Category>>(
      `${API_ROUTES.CATEGORY.UPDATE.replace(':id', id)}`,
      data,
    );
  },

  softDeleteCategory(id: string) {
    return api.patch<ApiResponse<Category>>(
      `${API_ROUTES.CATEGORY.SOFT_DELETE.replace(':id', id)}`,
    );
  },

  restoreCategory(id: string) {
    return api.patch<ApiResponse<Category>>(`${API_ROUTES.CATEGORY.RESTORE.replace(':id', id)}`);
  },

  getPaginatedCategories(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'ACTIVE' | 'INACTIVE';
    isDeleted?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isDeleted !== undefined)
      queryParams.append('isDeleted', params.isDeleted.toString());

    return api.get<
      ApiResponse<{
        data: Category[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>
    >(`/admin/categories/paginated?${queryParams.toString()}`);
  },

  async listPublic() {
    return api.get<ApiResponse<Category[]>>('/categories');
  },
};
