import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe non configurato' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Firma mancante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.client_reference_id
      const paymentIntentId = session.payment_intent as string

      if (orderId) {
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
        if (order && order.payment_status === 'pending_payment') {
          await supabase.from('orders').update({
            payment_status: 'paid',
            stripe_payment_intent_id: paymentIntentId,
            status: 'confirmed'
          }).eq('id', orderId)
        }
      }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.client_reference_id

      if (orderId) {
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
        if (order && order.payment_status === 'pending_payment') {
          await supabase.from('orders').update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          }).eq('id', orderId)
        }
      }
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = charge.payment_intent as string

      if (paymentIntentId) {
        const { data: order } = await supabase.from('orders').select('*').eq('stripe_payment_intent_id', paymentIntentId).single()
        if (order && order.payment_status === 'paid') {
          await supabase.from('orders').update({
            payment_status: 'refunded',
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          }).eq('id', order.id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Errore durante l\'elaborazione del webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
