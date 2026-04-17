import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState } from '@/features/cart/types/cart.types'

interface CartStore extends CartState {
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
}

function computeDerived(items: CartItem[]): Pick<CartState, 'totalItems' | 'totalPrice'> {
    return {
        totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.productId === item.productId)
                    let items: CartItem[]
                    if (existing) {
                        const next = existing.quantity + 1
                        const capped = Math.min(next, item.availableQuantity)
                        items = state.items.map((i) =>
                            i.productId === item.productId ? { ...i, quantity: capped } : i,
                        )
                    } else {
                        items = [...state.items, { ...item, quantity: 1 }]
                    }
                    return { items, ...computeDerived(items) }
                }),

            removeItem: (productId) =>
                set((state) => {
                    const items = state.items.filter((i) => i.productId !== productId)
                    return { items, ...computeDerived(items) }
                }),

            updateQuantity: (productId, quantity) =>
                set((state) => {
                    if (quantity <= 0) {
                        const items = state.items.filter((i) => i.productId !== productId)
                        return { items, ...computeDerived(items) }
                    }
                    const items = state.items.map((i) => {
                        if (i.productId !== productId) return i
                        return { ...i, quantity: Math.min(quantity, i.availableQuantity) }
                    })
                    return { items, ...computeDerived(items) }
                }),

            clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
        }),
        { name: 'cart' },
    ),
)
