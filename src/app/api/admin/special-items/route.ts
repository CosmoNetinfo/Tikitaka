import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const specialItemSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  image_url: z.string().url().optional().or(z.literal('')),
  available_dates: z.array(z.string()).optional(),
  includes_water: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get('company_id')
  if (!companyId) return NextResponse.json({ error: 'Manca company_id' }, { status: 400 })
  
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('special_items').select('*').eq('company_id', companyId).eq('is_active', true)
  
  if (error) return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  return NextResponse.json({ special_items: data })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = specialItemSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Dati non validi', details: parsed.error.format() }, { status: 400 })
    
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('special_items').insert(parsed.data).select().single()
    
    if (error) throw error
    return NextResponse.json({ special_item: data })
  } catch (error) {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
