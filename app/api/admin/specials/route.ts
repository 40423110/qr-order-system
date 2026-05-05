import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const items: Array<{ item_id: string; note: string; display_order: number }> = await request.json()

    // 刪除舊的，重新插入
    await supabaseAdmin.from('daily_specials').delete().neq('item_id', '')

    if (items.length > 0) {
      const { error } = await supabaseAdmin
        .from('daily_specials')
        .insert(items.map((item, i) => ({
          item_id: item.item_id,
          note: item.note || '',
          display_order: i,
          updated_at: new Date().toISOString(),
        })))

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
