'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent({ tableId }: { tableId: string }) {
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || '?'
  const orderId = searchParams.get('orderId') || ''
  const total = searchParams.get('total') || '0'

  const shortId = orderId ? orderId.slice(-8).toUpperCase() : '--------'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 shadow-md">
        <h1 className="text-base font-bold">享之饌東石鮮蚵</h1>
        <p className="text-xs opacity-90">{tableNumber} 號桌</p>
      </div>

      {/* Success Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1">訂單已送出！</h2>
          <p className="text-sm text-gray-500 mb-6">
            廚房正在準備您的餐點，請稍候
          </p>

          <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">桌號</span>
              <span className="font-semibold text-gray-800">{tableNumber} 號桌</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">訂單編號</span>
              <span className="font-mono font-semibold text-gray-800">#{shortId}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-orange-200 pt-2 mt-2">
              <span className="text-gray-600 font-medium">合計金額</span>
              <span className="font-bold text-orange-500 text-base">NT$ {total}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/menu/${tableId}?table=${tableNumber}`}
              className="block w-full bg-orange-500 text-white font-bold py-3.5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              繼續加點
            </Link>
            <p className="text-xs text-gray-400">
              如需修改訂單請告知服務人員
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage({
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
      <SuccessContent tableId={params.tableId} />
    </Suspense>
  )
}
