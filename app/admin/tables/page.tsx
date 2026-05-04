'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Table } from '@/types'
import QRCode from 'qrcode'

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [appUrl, setAppUrl] = useState('')
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({})

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
    }
    checkAuth()
    setAppUrl(window.location.origin)

    const fetchTables = async () => {
      const { data } = await supabase
        .from('tables')
        .select('*')
        .order('table_number')
      if (data) setTables(data as Table[])
      setLoading(false)
    }
    fetchTables()
  }, [router])

  const generateQR = useCallback(async (table: Table, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !appUrl) return
    const url = `${appUrl}/menu/${table.id}?table=${table.table_number}`
    await QRCode.toCanvas(canvas, url, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    })
  }, [appUrl])

  useEffect(() => {
    if (!appUrl || tables.length === 0) return
    tables.forEach((t) => {
      const canvas = canvasRefs.current[t.table_number]
      if (canvas) generateQR(t, canvas)
    })
  }, [tables, appUrl, generateQR])

  const downloadQR = (table: Table) => {
    const canvas = canvasRefs.current[table.table_number]
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-table-${table.table_number}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadAllQR = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const perRow = 2
    const qrSize = 70
    const marginX = 20
    const marginY = 20
    const paddingY = 30

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i]
      const canvas = canvasRefs.current[table.table_number]
      if (!canvas) continue

      const col = i % perRow
      const row = Math.floor((i % (perRow * 3)) / perRow)

      if (i > 0 && i % (perRow * 3) === 0) doc.addPage()

      const x = marginX + col * (qrSize + marginX)
      const y = marginY + row * (qrSize + paddingY)

      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', x, y, qrSize, qrSize)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${table.table_number} 號桌`, x + qrSize / 2, y + qrSize + 8, { align: 'center' })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('掃描QR Code點餐', x + qrSize / 2, y + qrSize + 14, { align: 'center' })
    }

    doc.save('qr-codes-all-tables.pdf')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white text-xl">←</a>
            <h1 className="text-base font-bold">桌位 QR Code 管理</h1>
          </div>
          <button
            onClick={downloadAllQR}
            className="text-xs bg-orange-400 hover:bg-orange-300 px-3 py-1.5 rounded-lg font-medium"
          >
            匯出全部 PDF
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <p className="text-sm text-gray-500 mb-4">
          點選「下載」儲存單張 QR Code 圖片，或「匯出全部 PDF」一次列印所有桌位。
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="font-bold text-gray-800 mb-3">{table.table_number} 號桌</p>
              <canvas
                ref={(el) => { canvasRefs.current[table.table_number] = el }}
                className="mx-auto rounded-lg"
              />
              <button
                onClick={() => downloadQR(table)}
                className="mt-3 w-full bg-orange-500 text-white text-xs font-medium py-2 rounded-xl active:scale-95 transition-transform"
              >
                下載 PNG
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
