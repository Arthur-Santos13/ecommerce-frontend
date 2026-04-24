import { apiClient } from '@/services'
import type { CategoryRequest, CategoryResponse } from '../types/product.types'

export const categoryService = {
    findAll(): Promise<CategoryResponse[]> {
        return apiClient.get<CategoryResponse[]>('/api/v1/categories').then((r) => r.data)
    },

    create(request: CategoryRequest): Promise<CategoryResponse> {
        return apiClient.post<CategoryResponse>('/api/v1/categories', request).then((r) => r.data)
    },

    update(id: string, request: CategoryRequest): Promise<CategoryResponse> {
        return apiClient.put<CategoryResponse>(`/api/v1/categories/${id}`, request).then((r) => r.data)
    },

    delete(id: string): Promise<void> {
        return apiClient.delete(`/api/v1/categories/${id}`).then(() => undefined)
    },
}
