import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('daily_specials')
    .select('item_id, note, display_order')
    .order('display_order')

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}
