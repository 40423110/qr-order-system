'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import Link from 'next/link'

const STATUS_FLOW: { from: OrderStatus; to: OrderStatus; label: string; color: string }[] = [
  { from: 'pending',   to: 'confirmed', label: '確認接單', color: 'bg-blue-500'  },
  { from: 'confirmed', to: 'completed', label: '標記完成', color: 'bg-green-500' },
  { from: 'completed', to: 'paid',      label: '已結帳',   color: 'bg-gray-600'  },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   '待處理',
  confirmed: '製作中',
  completed: '已完成',
  paid:      '已結帳',
}

export default function OrderDetailPage({
  params,
}: {
  params: { orderId: string }
}) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
    }
    checkAuth()

    const fetchOrder = async () => {
      const res = await fetch(`/api/admin/orders/${params.orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
      setLoading(false)
    }
    fetchOrder()
  }, [params.orderId, router])

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!order || updating) return
    setUpdating(true)
    setError('')
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrder((prev) => prev ? { ...prev, ...updated } : prev)
    } else {
      setError('更新失敗，請重試')
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <p className="text-gray-500">找不到此訂單</p>
        <Link href="/admin" className="text-orange-500 font-semibold">返回後台</Link>
      </div>
    )
  }

  const nextAction = STATUS_FLOW.find((s) => s.from === order.status)
  const time = new Date(order.created_at).toLocaleString('zh-TW', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-10 shadow-md print:hidden">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-white text-xl">←</Link>
          <div className="flex-1">
            <h1 className="text-base font-bold">{order.table_number} 號桌 · 訂單詳情</h1>
            <p className="text-xs opacity-80">{time}</p>
          </div>
          <button onClick={() => window.print()} className="text-xs bg-orange-400 px-3 py-1.5 rounded-lg">
            列印
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-32">
        {/* Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 mb-1">訂單狀態</p>
            <p className="font-bold text-lg text-gray-800">{STATUS_LABEL[order.status]}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">訂單編號</p>
            <p className="font-mono text-sm text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">點餐明細</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.order_items?.map((item) => (
              <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {item.item_name} × {item.quantity}
                  </p>
                  {item.special_request && (
                    <p className="text-xs text-gray-400 mt-0.5">備註：{item.special_request}</p>
                  )}
                </div>
                <p className="font-semibold text-gray-700 text-sm">NT$ {item.subtotal}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-4 bg-orange-50 flex justify-between items-center border-t border-orange-100">
            <span className="font-bold text-gray-700">合計</span>
            <span className="font-black text-orange-500 text-xl">NT$ {order.total_amount}</span>
          </div>
        </div>

        {/* Note */}
        {order.customer_note && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">客人備註</p>
            <p className="text-sm text-gray-700">{order.customer_note}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Action Button */}
      {nextAction && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg print:hidden">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => updateStatus(nextAction.to)}
              disabled={updating}
              className={`w-full ${nextAction.color} disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-transform`}
            >
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  更新中...
                </span>
              ) : nextAction.label}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
