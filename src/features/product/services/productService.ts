import { apiClient } from '@/services'
import type { PageResponse, ProductFilter, ProductResponse } from '../types/product.types'

export const productService = {
    findAll(filter: ProductFilter = {}): Promise<PageResponse<ProductResponse>> {
        const { name, minPrice, maxPrice, inStock, categoryId, page = 0, size = 20, sort = 'name,asc' } = filter
        return apiClient
            .get<PageResponse<ProductResponse>>('/api/v1/products', {
                params: { name, minPrice, maxPrice, inStock, categoryId, page, size, sort },
            })
            .then((r) => r.data)
    },

    findById(id: string): Promise<ProductResponse> {
        return apiClient.get<ProductResponse>(`/api/v1/products/${id}`).then((r) => r.data)
    },
}
