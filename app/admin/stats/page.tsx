'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface OrderRow {
  id: string
  table_number: number
  status: string
  total_amount: number
  created_at: string
  paid_at: string | null
}

interface DayStat {
  dateLabel: string
  dateKey: string
  count: number
  total: number
  paid: number
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateLabel(dateKey: string): string {
  const [, m, d] = dateKey.split('-')
  return `${parseInt(m)}/${parseInt(d)}`
}

function buildStats(orders: OrderRow[]) {
  const now = new Date()
  const todayKey = toLocalDateKey(now)

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toLocalDateKey(yesterday)

  // Build per-day map for last 7 days
  const days: DayStat[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = toLocalDateKey(d)
    days.push({ dateLabel: formatDateLabel(key), dateKey: key, count: 0, total: 0, paid: 0 })
  }

  const dayMap: Record<string, DayStat> = {}
  for (const day of days) dayMap[day.dateKey] = day

  // Aggregate orders
  for (const order of orders) {
    const key = toLocalDateKey(new Date(order.created_at))
    if (dayMap[key]) {
      dayMap[key].count++
      dayMap[key].total += order.total_amount ?? 0
      if (order.status === 'paid') {
        dayMap[key].paid += order.total_amount ?? 0
      }
    }
  }

  const today = dayMap[todayKey] ?? { count: 0, total: 0, paid: 0 }
  const todayPending = today.total - today.paid

  return { days, today, todayPending, todayKey, yesterdayKey }
}

export default function StatsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, table_number, status, total_amount, created_at, paid_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setOrders((data as OrderRow[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '載入失敗，請重試')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const { days, today, todayPending } = buildStats(orders)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-white text-xl">←</Link>
          <div className="flex-1">
            <h1 className="text-base font-bold">當日結算</h1>
            <p className="text-xs opacity-80">過去 30 天資料</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="text-xs bg-orange-400 hover:bg-orange-300 disabled:opacity-50 px-3 py-1.5 rounded-lg"
          >
            {refreshing ? '更新中...' : '重新整理'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* Today Overview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-orange-500 px-4 py-3">
            <h2 className="text-white font-bold text-sm">
              今日概覽（{formatDateLabel(toLocalDateKey(new Date()))}）
            </h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-gray-400 mb-1">訂單總數</p>
              <p className="text-4xl font-black text-orange-500">{today.count}</p>
              <p className="text-xs text-gray-400 mt-1">筆</p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-gray-400 mb-1">今日總金額</p>
              <p className="text-3xl font-black text-gray-800">
                {today.total.toLocaleString('zh-TW')}
              </p>
              <p className="text-xs text-gray-400 mt-1">NT$</p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-gray-400 mb-1">已結帳</p>
              <p className="text-3xl font-black text-green-600">
                {today.paid.toLocaleString('zh-TW')}
              </p>
              <p className="text-xs text-gray-400 mt-1">NT$</p>
            </div>
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-gray-400 mb-1">待結帳</p>
              <p className="text-3xl font-black text-yellow-500">
                {todayPending.toLocaleString('zh-TW')}
              </p>
              <p className="text-xs text-gray-400 mt-1">NT$</p>
            </div>
          </div>
        </div>

        {/* 7-day Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">過去 7 天明細</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="px-4 py-2 text-left font-medium">日期</th>
                  <th className="px-4 py-2 text-right font-medium">訂單數</th>
                  <th className="px-4 py-2 text-right font-medium">總金額</th>
                  <th className="px-4 py-2 text-right font-medium">已結帳</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {days.map((day) => {
                  const isToday = day.dateKey === toLocalDateKey(new Date())
                  return (
                    <tr key={day.dateKey} className={isToday ? 'bg-orange-50' : ''}>
                      <td className={`px-4 py-3 font-medium ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                        {day.dateLabel}
                        {isToday && <span className="ml-1 text-xs text-orange-400">今日</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{day.count}</td>
                      <td className="px-4 py-3 text-right text-gray-800 font-medium">
                        {day.total > 0 ? day.total.toLocaleString('zh-TW') : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        {day.paid > 0 ? day.paid.toLocaleString('zh-TW') : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
