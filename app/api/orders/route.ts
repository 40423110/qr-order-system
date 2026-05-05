import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MENU_CATEGORIES } from '@/lib/menu-data'
import { tItem } from '@/lib/i18n'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableId, tableNumber, items, customerNote } = body

    if (!tableNumber || !items || items.length === 0) {
      return NextResponse.json({ error: '資料不完整（缺少桌號或品項）' }, { status: 400 })
    }

    // 用 tableNumber 查詢 tables 表取得 UUID；找不到就用 null（FK-safe）
    let resolvedTableId: string | null = null
    if (tableId) {
      // 先嘗試用傳入的 tableId（UUID）確認該桌存在
      const { data: tableByUuid } = await supabaseAdmin
        .from('tables')
        .select('id')
        .eq('id', tableId)
        .maybeSingle()
      if (tableByUuid) {
        resolvedTableId = tableByUuid.id
      }
    }
    if (!resolvedTableId && tableNumber) {
      // fallback：用桌號查 UUID
      const { data: tableByNumber } = await supabaseAdmin
        .from('tables')
        .select('id')
        .eq('table_number', tableNumber)
        .maybeSingle()
      resolvedTableId = tableByNumber?.id ?? null
    }

    // 防重複：檢查同桌在過去 30 秒內是否已送出（僅在有 table_id 時進行）
    if (resolvedTableId) {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString()
      const { data: recentOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('table_id', resolvedTableId)
        .gte('created_at', thirtySecondsAgo)
        .maybeSingle()

      if (recentOrder) {
        return NextResponse.json(
          { error: '請稍待片刻再送出，防止重複訂單' },
          { status: 429 }
        )
      }
    }

    // 驗證品項並計算金額
    const allItems = MENU_CATEGORIES.flatMap((c) => c.items)
    let totalAmount = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validatedItems: any[] = []

    for (const orderItem of items) {
      const menuItem = allItems.find((i) => i.id === orderItem.itemId)
      if (!menuItem) {
        return NextResponse.json(
          { error: `找不到品項: ${orderItem.itemId}` },
          { status: 400 }
        )
      }
      if (!menuItem.isAvailable) {
        const displayName = tItem(menuItem.id, 'zh-TW')
        return NextResponse.json(
          { error: `品項已售完: ${displayName}` },
          { status: 400 }
        )
      }
      const subtotal = menuItem.price * orderItem.quantity
      totalAmount += subtotal
      // 用 tItem 取得中文名稱，避免存入 ID 字串
      const itemName = tItem(menuItem.id, 'zh-TW')
      validatedItems.push({
        item_id: orderItem.itemId,
        item_name: itemName,
        item_price: menuItem.price,
        quantity: orderItem.quantity,
        subtotal,
        special_request: orderItem.specialRequest || null,
      })
    }

    // 建立訂單（table_id 可為 null，需先執行 supabase/migrations/002_fix_table_id.sql）
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        table_id: resolvedTableId,
        table_number: tableNumber,
        status: 'pending',
        total_amount: totalAmount,
        customer_note: customerNote || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Insert order error:', orderError)
      return NextResponse.json(
        { error: `建立訂單失敗：${orderError.message}` },
        { status: 500 }
      )
    }

    // 建立訂單明細
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(validatedItems.map((i) => ({ ...i, order_id: order.id })))

    if (itemsError) {
      console.error('Insert order_items error:', itemsError)
      return NextResponse.json(
        { error: `建立訂單明細失敗：${itemsError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ orderId: order.id, totalAmount })
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tableId = searchParams.get('tableId')

  const query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (tableId) {
    query.eq('table_id', tableId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
