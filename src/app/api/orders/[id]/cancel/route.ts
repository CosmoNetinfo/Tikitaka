import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { toZonedTime, format } from 'date-fns-tz'
import { isBefore, parseISO, addDays } from 'date-fns'
import { z } from 'zod'

const cancelSchema = z.object({
  client_token: z.string().optional(),
  public_code: z.string().optional()
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const body = await request.json()
    const parsed = cancelSchema.safeParse(body)
    
    if (!parsed.success || (!parsed.data.client_token && !parsed.data.public_code)) {
      return NextResponse.json({ error: 'Credenziali mancanti' }, { status: 400 })
    }
    
    const supabase = createAdminClient()
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, company:companies(*, company_settings(*))')
      .eq('id', orderId)
      .single()
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
    }
    
    if (parsed.data.client_token && order.client_token !== parsed.data.client_token) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }
    
    if (parsed.data.public_code && order.public_code !== parsed.data.public_code) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }
    
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'L\'ordine è già annullato' }, { status: 400 })
    }
    
    const settings = order.company.company_settings[0]
    const cancelTime = settings?.cancel_until_time || '09:00'
    
    const TIMEZONE = 'Europe/Rome'
    const nowZoned = toZonedTime(new Date(), TIMEZONE)
    
    const deliveryDate = parseISO(order.delivery_date)
    const [hours, minutes] = cancelTime.split(':').map(Number)
    deliveryDate.setHours(hours, minutes, 0, 0)
    
    if (!isBefore(nowZoned, deliveryDate)) {
      return NextResponse.json({ error: 'Tempo massimo per annullare superato' }, { status: 400 })
    }
    
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
      
    if (updateError) throw updateError
    
    // If paid with card, issue refund via Stripe
    if (order.payment_method === 'card' && order.payment_status === 'paid' && order.stripe_payment_intent_id) {
      // process stripe refund here...
    }
    
    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Errore in cancel order:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
