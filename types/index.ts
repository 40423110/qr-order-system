export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'paid'

export interface Table {
  id: string
  table_number: number
  label: string
  is_active: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  price: number
  description?: string
  isAvailable: boolean
}

export interface MenuCategory {
  id: string
  name: string
  sortOrder: number
  items: MenuItem[]
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  specialRequest?: string
}

export interface Order {
  id: string
  table_id: string
  table_number: number
  status: OrderStatus
  total_amount: number
  customer_note?: string
  created_at: string
  completed_at?: string
  paid_at?: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string
  item_name: string
  item_price: number
  quantity: number
  subtotal: number
  special_request?: string
}
