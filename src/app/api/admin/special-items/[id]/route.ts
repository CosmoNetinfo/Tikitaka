import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('special_items').update(body).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json({ special_item: data })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('special_items').update({ is_active: false }).eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
