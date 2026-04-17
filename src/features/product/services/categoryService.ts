import { apiClient } from '@/services'
import type { CategoryResponse } from '../types/product.types'

export const categoryService = {
    findAll(): Promise<CategoryResponse[]> {
        return apiClient.get<CategoryResponse[]>('/api/v1/categories').then((r) => r.data)
    },
}
