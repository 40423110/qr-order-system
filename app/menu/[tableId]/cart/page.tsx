'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useLangStore } from '@/store/languageStore'
import { tItem, t } from '@/lib/i18n'
import ItemName from '@/components/ItemName'

function CartContent({ tableId }: { tableId: string }) {
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '?'
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems } =
    useCartStore()
  const { lang } = useLangStore()
  const ui = t(lang)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (items.length === 0) return
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          tableNumber: Number(tableNumber),
          items: items.map((i) => ({
            itemId: i.menuItem.id,
            quantity: i.quantity,
            specialRequest: i.specialRequest || '',
          })),
          customerNote: note,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '送出失敗，請稍後再試')
        setIsSubmitting(false)
        return
      }

      clearCart()
      router.push(
        `/menu/${tableId}/success?table=${tableNumber}&orderId=${data.orderId}&total=${data.totalAmount}`
      )
    } catch {
      setError('網路錯誤，請確認連線後再試')
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-500 text-base mb-6">{ui.empty}</p>
        <Link
          href={`/menu/${tableId}?table=${tableNumber}`}
          className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold"
        >
          {ui.backToMenu}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <Link
          href={`/menu/${tableId}?table=${tableNumber}`}
          className="text-white text-xl"
        >
          ←
        </Link>
        <div>
          <h1 className="text-base font-bold">購物車</h1>
          <p className="text-xs opacity-90">{tableNumber} 號桌 · 共 {totalItems()} 項</p>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3 max-w-lg mx-auto">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">已選品項</h2>
        {items.map((cartItem) => (
          <div
            key={cartItem.menuItem.id}
            className="bg-white rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <ItemName
                  name={tItem(cartItem.menuItem.id, lang)}
                  redChar={cartItem.menuItem.redChar}
                  className="font-medium text-gray-800 text-sm"
                />
                <p className="text-orange-500 text-sm font-bold mt-0.5">
                  NT$ {cartItem.menuItem.price} × {cartItem.quantity} ={' '}
                  <span className="text-gray-700">
                    NT$ {cartItem.menuItem.price * cartItem.quantity}
                  </span>
                </p>
              </div>
              <button
                onClick={() => removeItem(cartItem.menuItem.id)}
                className="text-gray-300 hover:text-red-400 ml-3 text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() =>
                  updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)
                }
                className="w-8 h-8 rounded-full border-2 border-orange-400 text-orange-500 font-bold text-lg flex items-center justify-center"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-gray-700">
                {cartItem.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)
                }
                className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-lg flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm mt-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            全單備註（過敏原、特殊需求等）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例：蝦仁過敏、不要辣、少鹽..."
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={3}
          />
        </div>

        {/* Summary */}
        <div className="bg-orange-50 rounded-2xl px-4 py-4 shadow-sm">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>品項數量</span>
            <span>{totalItems()} 件</span>
          </div>
          <div className="flex justify-between items-center text-base font-bold text-gray-800 border-t border-orange-200 pt-2 mt-2">
            <span>合計金額</span>
            <span className="text-orange-500 text-lg">NT$ {totalAmount()}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-500 disabled:bg-orange-300 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-transform"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                送出中...
              </span>
            ) : (
              `送出訂單 · NT$ ${totalAmount()}`
            )}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            送出後無法修改，請確認品項正確
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CartPage({
  params,
}: {
  params: { tableId: string }
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CartContent tableId={params.tableId} />
    </Suspense>
  )
}
