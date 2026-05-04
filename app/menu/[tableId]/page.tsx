'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MENU_CATEGORIES } from '@/lib/menu-data'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { MenuItem } from '@/types'

function MenuContent({ tableId }: { tableId: string }) {
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '?'
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id)
  const { addItem, totalItems, totalAmount, items } = useCartStore()

  const currentCategory = MENU_CATEGORIES.find((c) => c.id === activeCategory)

  const getItemCount = (itemId: string) => {
    const found = items.find((i) => i.menuItem.id === itemId)
    return found ? found.quantity : 0
  }

  const handleAdd = (item: MenuItem) => {
    addItem(item)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-20 shadow-md">
        <h1 className="text-lg font-bold tracking-wide">享之饌東石鮮蚵</h1>
        <p className="text-sm opacity-90 mt-0.5">🪑 {tableNumber} 號桌</p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[68px] z-10 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                activeCategory === cat.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        <h2 className="text-base font-semibold text-gray-700 mb-2">
          {currentCategory?.name}
        </h2>
        {currentCategory?.items.map((item) => {
          const count = getItemCount(item.id)
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center transition-opacity ${
                !item.isAvailable ? 'opacity-40' : ''
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-medium text-gray-800 text-sm leading-snug">
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
                <p className="text-orange-500 font-bold text-sm mt-1">
                  NT$ {item.price}
                </p>
                {!item.isAvailable && (
                  <span className="text-xs text-red-400 font-medium">售完</span>
                )}
              </div>

              {item.isAvailable ? (
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <>
                      <button
                        onClick={() => {
                          const store = useCartStore.getState()
                          store.updateQuantity(item.id, count - 1)
                        }}
                        className="w-8 h-8 rounded-full border-2 border-orange-400 text-orange-500 font-bold text-lg flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-gray-700">
                        {count}
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => handleAdd(item)}
                    className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">×</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Cart Float Button */}
      {totalItems() > 0 && (
        <Link
          href={`/menu/${tableId}/cart?table=${tableNumber}`}
          className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto bg-orange-500 text-white rounded-2xl py-4 px-5 flex justify-between items-center shadow-xl active:scale-95 transition-transform"
          style={{ left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 2rem)', maxWidth: '28rem' }}
        >
          <span className="bg-orange-700 rounded-full w-7 h-7 text-sm font-bold flex items-center justify-center">
            {totalItems()}
          </span>
          <span className="font-bold text-base">查看購物車</span>
          <span className="font-bold text-base">NT$ {totalAmount()}</span>
        </Link>
      )}
    </div>
  )
}

export default function MenuPage({
  params,
}: {
  params: { tableId: string }
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">載入菜單中...</p>
        </div>
      </div>
    }>
      <MenuContent tableId={params.tableId} />
    </Suspense>
  )
}
