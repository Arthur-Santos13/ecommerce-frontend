export interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
    availableQuantity: number
}

export interface CartState {
    items: CartItem[]
    totalItems: number
    totalPrice: number
}
