import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCutoffPassed } from '@/lib/utils/cutoff'
import { calculateOrderTotal } from '@/lib/utils/pricing'
import { z } from 'zod'

const updateSchema = z.object({
  client_token: z.string(),
  primo_formato: z.string().optional(),
  primo_condimento: z.string().optional(),
  secondo: z.string().optional(),
  contorno: z.string().optional(),
  drink: z.string().optional(),
  special_items: z.array(z.object({
    id: z.string().uuid(),
    qty: z.number().int().min(1).max(3)
  })).optional(),
  notes: z.string().max(200).optional(),
  slot_id: z.string().uuid().optional()
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.format() }, { status: 400 })
    }
    const data = parsed.data
    const supabase = createAdminClient()
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, company:companies(*, company_settings(*))')
      .eq('id', orderId)
      .single()
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }
    
    if (order.client_token !== data.client_token) {
      return NextResponse.json({ error: 'Non autorizzato a modificare questo ordine' }, { status: 403 })
    }
    
    if (order.payment_method !== 'cash') {
      return NextResponse.json({ error: 'Solo gli ordini in contanti possono essere modificati. Per gli altri annulla l\'ordine e ricrealo.' }, { status: 400 })
    }
    
    const settings = order.company.company_settings[0]
    if (isCutoffPassed(order.delivery_date, settings?.cutoff_time)) {
      return NextResponse.json({ error: 'Tempo massimo per modificare l\'ordine superato' }, { status: 400 })
    }
    
    // Validate changes and recalculate price
    const hasCombo = !!(data.primo_formato || data.secondo)
    const hasSpecial = !!(data.special_items && data.special_items.length > 0)
    
    let specialItemsDb = []
    if (hasSpecial) {
      const ids = data.special_items!.map(s => s.id)
      const { data: dbItems } = await supabase.from('special_items').select('*').in('id', ids).eq('is_active', true)
      specialItemsDb = dbItems || []
    }
    
    const { data: dbCombos } = await supabase.from('combos').select('*').eq('is_active', true)

    const pricingResult = calculateOrderTotal({
      combo: hasCombo ? {
        primo_formato: data.primo_formato,
        primo_condimento: data.primo_condimento,
        secondo: data.secondo,
        contorno: data.contorno,
        drink: data.drink
      } : undefined,
      special_items: data.special_items?.map(si => ({
        id: si.id,
        qty: si.qty,
        dbItem: specialItemsDb.find(d => d.id === si.id)
      })),
      combos: dbCombos || undefined
    })

    if (!pricingResult.valid) {
      return NextResponse.json({ error: pricingResult.error || 'Combinazione non valida' }, { status: 400 })
    }

    const { total_cents, subtotal_cents, order_lines, combo: matchedCombo } = pricingResult
    
    // Update order
    const updateData: any = {
      total_cents,
      subtotal_cents,
      combo_id: matchedCombo?.id || null,
      primo_formato: data.primo_formato || null,
      primo_condimento: data.primo_condimento || null,
      secondo: data.secondo || null,
      contorno: data.contorno || null,
      drink: data.drink || null,
      notes: data.notes !== undefined ? data.notes : order.notes
    }
    if (data.slot_id) updateData.slot_id = data.slot_id
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()
      
    if (updateError) throw updateError
    
    // Replace order lines
    await supabase.from('order_lines').delete().eq('order_id', orderId)
    if (order_lines.length > 0) {
      const linesToInsert = order_lines.map((line: any) => ({
        order_id: orderId,
        ...line
      }))
      await supabase.from('order_lines').insert(linesToInsert)
    }
    
    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Errore in update order:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
