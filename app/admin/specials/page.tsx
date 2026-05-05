'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { MENU_CATEGORIES, ALL_MENU_ITEMS } from '@/lib/menu-data'
import { tItem } from '@/lib/i18n'
import Link from 'next/link'
import ItemName from '@/components/ItemName'

interface SpecialItem {
  item_id: string
  note: string
}

export default function SpecialsPage() {
  const router = useRouter()
  const [specials, setSpecials] = useState<SpecialItem[]>([])
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
    }
    checkAuth()

    fetch('/api/specials')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSpecials(data.map((d: any) => ({ item_id: d.item_id, note: d.note || '' })))
      })
      .finally(() => setLoading(false))
  }, [router])

  const allItems = ALL_MENU_ITEMS
  const filteredItems = search.trim()
    ? allItems.filter(i => {
        const name = tItem(i.id, 'zh-TW').toLowerCase()
        return name.includes(search.trim().toLowerCase()) && !specials.find(s => s.item_id === i.id)
      })
    : []

  const addItem = (itemId: string) => {
    if (specials.find(s => s.item_id === itemId)) return
    setSpecials(prev => [...prev, { item_id: itemId, note: '' }])
    setSearch('')
  }

  const removeItem = (itemId: string) => {
    setSpecials(prev => prev.filter(s => s.item_id !== itemId))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...specials]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setSpecials(next)
  }

  const moveDown = (index: number) => {
    if (index === specials.length - 1) return
    const next = [...specials]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setSpecials(next)
  }

  const updateNote = (itemId: string, note: string) => {
    setSpecials(prev => prev.map(s => s.item_id === itemId ? { ...s, note } : s))
  }

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/specials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(specials.map((s, i) => ({ ...s, display_order: i }))),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
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
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white text-xl">←</Link>
            <h1 className="text-base font-bold">⭐ 今日推薦設定</h1>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              saved ? 'bg-green-400 text-white' : 'bg-white text-orange-500 hover:bg-orange-50'
            }`}
          >
            {saving ? '儲存中...' : saved ? '✓ 已儲存' : '儲存'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
        {/* 搜尋新增 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-600 mb-2">新增品項</p>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="輸入品項名稱搜尋..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {filteredItems.length > 0 && (
            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {filteredItems.slice(0, 8).map(item => (
                <button
                  key={item.id}
                  onClick={() => addItem(item.id)}
                  className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex justify-between items-center"
                >
                  <span>{tItem(item.id, 'zh-TW')}</span>
                  <span className="text-orange-500 font-bold text-xs">+ 加入</span>
                </button>
              ))}
            </div>
          )}
          {search.trim() && filteredItems.length === 0 && (
            <p className="text-xs text-gray-400 mt-2 text-center">找不到符合的品項</p>
          )}
        </div>

        {/* 目前推薦清單 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-600">
              目前推薦（{specials.length} 項）
            </p>
            {specials.length > 0 && (
              <button
                onClick={() => setSpecials([])}
                className="text-xs text-red-400 hover:text-red-600"
              >
                清除全部
              </button>
            )}
          </div>

          {specials.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              尚未設定今日推薦<br/>
              <span className="text-xs">搜尋品項後點選加入</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {specials.map((special, index) => {
                const menuItem = ALL_MENU_ITEMS.find(i => i.id === special.item_id)
                if (!menuItem) return null
                return (
                  <div key={special.item_id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {/* 排序按鈕 */}
                      <div className="flex flex-col gap-0.5 pt-0.5">
                        <button onClick={() => moveUp(index)} className="text-gray-300 hover:text-gray-500 text-xs leading-none">▲</button>
                        <button onClick={() => moveDown(index)} className="text-gray-300 hover:text-gray-500 text-xs leading-none">▼</button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-gray-400 mr-1">{index + 1}.</span>
                            <span className="text-sm font-medium text-gray-800">{tItem(menuItem.id, 'zh-TW')}</span>
                            <span className="text-xs text-orange-500 ml-2">NT$ {menuItem.price}</span>
                          </div>
                          <button
                            onClick={() => removeItem(special.item_id)}
                            className="text-gray-300 hover:text-red-400 text-lg ml-2"
                          >×</button>
                        </div>
                        <input
                          type="text"
                          value={special.note}
                          onChange={e => updateNote(special.item_id, e.target.value)}
                          placeholder="備注（如：今日新鮮到貨、主廚推薦...）"
                          className="mt-1.5 w-full border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-200 text-gray-600 bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          儲存後客人菜單會立即出現「⭐ 今日推薦」分類
        </p>
      </div>
    </div>
  )
}
