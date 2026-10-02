import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token mancante' }, { status: 400 })

  const supabase = createAdminClient()
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, delivery_slots(*), order_lines(*)')
      .eq('client_token', token)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Errore in get mine orders:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
