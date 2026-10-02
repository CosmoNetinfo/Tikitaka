import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'Manca company_id' }, { status: 400 })
  
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('company_settings').select('*').eq('company_id', companyId).single()
  
  if (error) return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  return NextResponse.json({ settings: data })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const companyId = body.company_id
    if (!companyId) return NextResponse.json({ error: 'Manca company_id' }, { status: 400 })
    
    delete body.company_id // Don't update company_id
    
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('company_settings').update(body).eq('company_id', companyId).select().single()
    
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
