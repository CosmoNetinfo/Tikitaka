import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  try {
    const codeOrId = params.id
    // Query either by public_code or by uuid id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeOrId)
    
    let query = supabase
      .from('orders')
      .select('*, company:companies(*, company_settings(*)), slot:delivery_slots(*), order_lines(*)')

    if (isUuid) {
      query = query.eq('id', codeOrId)
    } else {
      query = query.eq('public_code', codeOrId)
    }

    const { data: order, error } = await query.single()

    if (error || !order) return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    
    return NextResponse.json({ order })
  } catch (error) {
    console.error('Errore in order detail:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
