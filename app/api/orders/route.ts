import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MENU_CATEGORIES } from '@/lib/menu-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableId, tableNumber, items, customerNote } = body

    if (!tableId || !tableNumber || !items || items.length === 0) {
      return NextResponse.json({ error: '資料不完整' }, { status: 400 })
    }

    // 防重複：檢查同桌在過去 30 秒內是否已送出
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString()
    const { data: recentOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('table_id', tableId)
      .gte('created_at', thirtySecondsAgo)
      .maybeSingle()

    if (recentOrder) {
      return NextResponse.json(
        { error: '請稍待片刻再送出，防止重複訂單' },
        { status: 429 }
      )
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
        return NextResponse.json(
          { error: `品項已售完: ${menuItem.name}` },
          { status: 400 }
        )
      }
      const subtotal = menuItem.price * orderItem.quantity
      totalAmount += subtotal
      validatedItems.push({
        item_id: orderItem.itemId,
        item_name: menuItem.name,
        item_price: menuItem.price,
        quantity: orderItem.quantity,
        subtotal,
        special_request: orderItem.specialRequest || null,
      })
    }

    // 建立訂單
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        table_id: tableId,
        table_number: tableNumber,
        status: 'pending',
        total_amount: totalAmount,
        customer_note: customerNote || null,
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // 建立訂單明細
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(validatedItems.map((i) => ({ ...i, order_id: order.id })))

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
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
