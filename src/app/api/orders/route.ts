import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { isCutoffPassed } from '@/lib/utils/cutoff'
import { calculateOrderTotal } from '@/lib/utils/pricing'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)

const orderSchema = z.object({
  company_slug: z.string(),
  delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
  slot_id: z.string().uuid(),
  customer_first_name: z.string().min(1, 'Nome richiesto'),
  customer_last_name: z.string().min(1, 'Cognome richiesto'),
  notes: z.string().max(200).optional(),
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
  payment_method: z.enum(['card', 'cash'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dati non validi', details: parsed.error.format() }, { status: 400 })
    }
    
    const data = parsed.data
    const supabase = createAdminClient()
    
    // 1. Company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*, company_settings(*), delivery_slots(*)')
      .eq('slug', data.company_slug)
      .eq('is_active', true)
      .single()
      
    if (companyError || !company) {
      return NextResponse.json({ error: 'Azienda non valida' }, { status: 400 })
    }
    
    // 2 & 3. Delivery date checks
    const deliveryDateObj = new Date(data.delivery_date)
    if (deliveryDateObj.getDay() === 0 || deliveryDateObj.getDay() === 6) {
      return NextResponse.json({ error: 'La data di consegna deve essere un giorno lavorativo' }, { status: 400 })
    }
    const settings = company.company_settings[0]
    if (settings?.closed_days?.includes(data.delivery_date)) {
      return NextResponse.json({ error: 'Azienda chiusa nella data selezionata' }, { status: 400 })
    }
    
    // 4. Cutoff
    if (isCutoffPassed(data.delivery_date, settings?.cutoff_time)) {
      return NextResponse.json({ error: 'Tempo massimo per ordinare superato' }, { status: 400 })
    }
    
    // 5. Slot
    const slot = company.delivery_slots.find((s: any) => s.id === data.slot_id && s.is_active)
    if (!slot) {
      return NextResponse.json({ error: 'Slot non valido' }, { status: 400 })
    }
    
    // 6 & 8. Validation logic
    const hasCombo = !!(data.primo_formato || data.secondo)
    const hasSpecial = !!(data.special_items && data.special_items.length > 0)
    
    if (!hasCombo && !hasSpecial) {
      return NextResponse.json({ error: 'Devi selezionare un menu o almeno un piatto speciale' }, { status: 400 })
    }
    
    if (hasCombo) {
      if (data.primo_formato && !data.primo_condimento) return NextResponse.json({ error: 'Seleziona un condimento per il primo' }, { status: 400 })
      if (!data.primo_formato && data.primo_condimento) return NextResponse.json({ error: 'Seleziona un formato per il primo' }, { status: 400 })
      if (data.contorno && !data.secondo) return NextResponse.json({ error: 'Il contorno richiede un secondo' }, { status: 400 })
    }
    
    // 7. Special items
    let specialItemsDb = []
    if (hasSpecial) {
      const ids = data.special_items!.map(s => s.id)
      const { data: dbItems } = await supabase.from('special_items').select('*').in('id', ids).eq('is_active', true)
      
      if (!dbItems || dbItems.length !== ids.length) {
        return NextResponse.json({ error: 'Alcuni piatti speciali non sono validi' }, { status: 400 })
      }
      
      for (const item of dbItems) {
        if (item.available_dates && !item.available_dates.includes(data.delivery_date)) {
          return NextResponse.json({ error: `Il piatto ${item.name} non è disponibile in questa data` }, { status: 400 })
        }
      }
      specialItemsDb = dbItems
    }
    
    // 9. Recalculate price from combos table
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
    
    // 10. Public code
    const publicCode = nanoid()
    
    // 11 & 12. Payment
    if (data.payment_method === 'card' && !settings?.card_payments_enabled) {
      return NextResponse.json({ error: 'Pagamenti con carta non abilitati' }, { status: 400 })
    }
    
    const paymentStatus = data.payment_method === 'cash' ? 'cash_pending' : 'pending_payment'
    
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        company_id: company.id,
        delivery_date: data.delivery_date,
        slot_id: data.slot_id,
        customer_first_name: data.customer_first_name,
        customer_last_name: data.customer_last_name,
        notes: data.notes,
        client_token: data.client_token,
        combo_id: matchedCombo?.id || null,
        primo_formato: data.primo_formato || null,
        primo_condimento: data.primo_condimento || null,
        secondo: data.secondo || null,
        contorno: data.contorno || null,
        drink: data.drink || null,
        subtotal_cents,
        total_cents,
        payment_method: data.payment_method,
        payment_status: paymentStatus,
        public_code: publicCode,
        status: 'active'
      })
      .select()
      .single()
      
    if (insertError) throw insertError
    
    // Insert order lines
    if (order_lines.length > 0) {
      const linesToInsert = order_lines.map((line: any) => ({
        order_id: newOrder.id,
        ...line
      }))
      await supabase.from('order_lines').insert(linesToInsert)
    }
    
    // Handle Stripe checkout if card
    let checkoutUrl = null
    if (data.payment_method === 'card') {
      // create stripe session logic here
      // ...
    }
    
    return NextResponse.json({ order: newOrder, checkoutUrl })
  } catch (error) {
    console.error('Errore in create order:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
