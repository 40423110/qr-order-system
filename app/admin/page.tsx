'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Order } from '@/types'
import Link from 'next/link'

const STATUS_MAP = {
  pending:   { label: '待處理', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  confirmed: { label: '製作中', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400'   },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', dot: 'bg-green-400'  },
  paid:      { label: '已結帳', color: 'bg-gray-100 text-gray-400',   dot: 'bg-gray-300'   },
}

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [hasNewOrder, setHasNewOrder] = useState(false)

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
    }
  }, [router])

  const fetchOrders = useCallback(async () => {
    const query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100)

    const { data } = await query
    if (data) setOrders(data as Order[])
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchOrders()

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
        setHasNewOrder(true)
        setTimeout(() => setHasNewOrder(false), 3000)
        try {
          new Audio('/notification.mp3').play().catch(() => {})
        } catch {}
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [checkAuth, fetchOrders])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const filteredOrders = filter === 'active'
    ? orders.filter((o) => o.status !== 'paid')
    : orders

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-20 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">享之饌 後台</h1>
            <p className="text-xs opacity-80">
              {pendingCount > 0 ? `⚡ ${pendingCount} 筆待處理` : '目前無待處理訂單'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/tables" className="text-xs bg-orange-400 hover:bg-orange-300 px-3 py-1.5 rounded-lg">
              QR Code
            </Link>
            <button onClick={handleLogout} className="text-xs opacity-70 hover:opacity-100">
              登出
            </button>
          </div>
        </div>
      </div>

      {/* New Order Toast */}
      {hasNewOrder && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold animate-bounce">
          🔔 新訂單！
        </div>
      )}

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            進行中
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            全部訂單
          </button>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p>{filter === 'active' ? '目前沒有進行中訂單' : '還沒有任何訂單'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8">
            {filteredOrders.map((order) => {
              const s = STATUS_MAP[order.status] || STATUS_MAP.pending
              const itemCount = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
              const time = new Date(order.created_at).toLocaleTimeString('zh-TW', {
                hour: '2-digit', minute: '2-digit'
              })
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border-2 ${
                    order.status === 'pending' ? 'border-yellow-300 animate-pulse-subtle' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-2xl font-black text-gray-800">{order.table_number}</span>
                      <span className="text-sm text-gray-400 ml-1">號桌</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.color}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot} mr-1`}></span>
                      {s.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {itemCount} 項 · {time}
                  </div>
                  <div className="font-bold text-orange-500">NT$ {order.total_amount}</div>
                  {order.customer_note && (
                    <div className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1 truncate">
                      備註：{order.customer_note}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
