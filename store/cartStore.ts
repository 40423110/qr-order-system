import { create } from 'zustand'
import { CartItem, MenuItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem, quantity?: number, specialRequest?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item, quantity = 1, specialRequest) => {
    set((state) => {
      const existing = state.items.find((i) => i.menuItem.id === item.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItem.id === item.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        }
      }
      return {
        items: [...state.items, { menuItem: item, quantity, specialRequest }],
      }
    })
  },
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItem.id !== itemId),
    }))
  },
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.menuItem.id === itemId ? { ...i, quantity } : i
      ),
    }))
  },
  clearCart: () => set({ items: [] }),
  totalAmount: () =>
    get().items.reduce(
      (sum, i) => sum + i.menuItem.price * i.quantity,
      0
    ),
  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
