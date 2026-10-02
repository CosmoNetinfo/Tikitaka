import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest, { params }: { params: { publicCode: string } }) {
  const supabase = createAdminClient()
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, company:companies(*, company_settings(*)), slot:delivery_slots(*), order_lines(*)')
      .eq('public_code', params.publicCode)
      .single()

    if (error || !order) return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Errore in order detail:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
