export interface CategoryResponse {
    id: string
    name: string
    description: string | null
}

export interface ProductResponse {
    id: string
    name: string
    description: string | null
    price: number
    sku: string
    version: number
    quantityInStock: number
    reservedQuantity: number
    availableQuantity: number
    category: CategoryResponse | null
    createdAt: string
    updatedAt: string
}

export interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

export interface ProductFilter {
    name?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
    categoryId?: string
    page?: number
    size?: number
    sort?: string
}
