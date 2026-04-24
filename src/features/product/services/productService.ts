import { apiClient } from '@/services'
import type { PageResponse, ProductFilter, ProductRequest, ProductResponse, StockAdjustmentRequest } from '../types/product.types'

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

    create(request: ProductRequest): Promise<ProductResponse> {
        return apiClient.post<ProductResponse>('/api/v1/products', request).then((r) => r.data)
    },

    update(id: string, request: ProductRequest): Promise<ProductResponse> {
        return apiClient.put<ProductResponse>(`/api/v1/products/${id}`, request).then((r) => r.data)
    },

    delete(id: string): Promise<void> {
        return apiClient.delete(`/api/v1/products/${id}`).then(() => undefined)
    },

    restore(id: string): Promise<ProductResponse> {
        return apiClient.patch<ProductResponse>(`/api/v1/products/${id}/restore`).then((r) => r.data)
    },

    restock(id: string, request: StockAdjustmentRequest): Promise<ProductResponse> {
        return apiClient.patch<ProductResponse>(`/api/v1/products/${id}/inventory/restock`, request).then((r) => r.data)
    },
}
