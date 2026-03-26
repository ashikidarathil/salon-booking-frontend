import { api } from '@/services/api/api';
import { API_ROUTES } from '@/common/constants/api.routes';
import type { ApiResponse } from '@/common/types/api.types';
import type {
  Category,
  CategoryQuery,
  PaginatedCategoryResponse,
  CategoryStatus,
} from '@/features/category/category.types';

export const categoryService = {
  listCategories(includeDeleted = false) {
    return api.get<ApiResponse<Category[]>>(API_ROUTES.CATEGORY.ADMIN_LIST, {
      params: { includeDeleted },
    });
  },

  createCategory(data: { name: string; description?: string }) {
    return api.post<ApiResponse<Category>>(API_ROUTES.CATEGORY.CREATE, data);
  },

  updateCategory(
    id: string,
    data: Partial<{ name: string; description?: string; status?: CategoryStatus }>,
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

  getPaginatedCategories(params?: CategoryQuery) {
    return api.get<ApiResponse<PaginatedCategoryResponse>>(API_ROUTES.CATEGORY.PAGINATED, {
      params,
    });
  },

  async listPublic() {
    return api.get<ApiResponse<Category[]>>(API_ROUTES.CATEGORY.PUBLIC_LIST);
  },
};
