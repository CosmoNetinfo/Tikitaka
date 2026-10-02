import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function checkAdminAuth(companyId: string) {
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) }
      }
    }
  )

  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return false

  const supabase = createAdminClient()
  const { data: adminRole } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('company_id', companyId)
    .single()

  return !!adminRole
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date')
  const companyId = request.nextUrl.searchParams.get('company_id')

  if (!date || !companyId) {
    return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
  }

  const isAdmin = await checkAdminAuth(companyId)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_lines(*), slot:delivery_slots(*)')
      .eq('company_id', companyId)
      .eq('delivery_date', date)
      .neq('status', 'cancelled')

    if (error) throw error

    // Group by slot
    const slotsMap: Record<string, any> = {}
    
    // Financials
    let expected_revenue = 0
    let already_paid = 0
    let cash_pending = 0
    let cash_received = 0

    orders.forEach(order => {
      expected_revenue += order.total_cents
      
      if (order.payment_method === 'card' && order.payment_status === 'paid') {
        already_paid += order.total_cents
      } else if (order.payment_method === 'cash') {
        if (order.payment_status === 'cash_received') {
          cash_received += order.total_cents
        } else {
          cash_pending += order.total_cents
        }
      }

      const slotId = order.slot_id
      if (!slotsMap[slotId]) {
        slotsMap[slotId] = {
          slot: order.slot,
          orders: [],
          kitchen_summary: {
            primi: {},
            secondi: {},
            contorni: {},
            bibite: {},
            special_items: {}
          }
        }
      }

      slotsMap[slotId].orders.push(order)

      // Kitchen summary logic
      order.order_lines.forEach((line: any) => {
        const summary = slotsMap[slotId].kitchen_summary
        if (line.item_type === 'special_item') {
          const key = line.item_name
          summary.special_items[key] = (summary.special_items[key] || 0) + line.quantity
        } else {
          if (line.item_category === 'Primo') {
            const key = line.item_name // expecting "formato - condimento"
            summary.primi[key] = (summary.primi[key] || 0) + line.quantity
          } else if (line.item_category === 'Secondo') {
            summary.secondi[line.item_name] = (summary.secondi[line.item_name] || 0) + line.quantity
          } else if (line.item_category === 'Contorno') {
            summary.contorni[line.item_name] = (summary.contorni[line.item_name] || 0) + line.quantity
          } else if (line.item_category === 'Bibita') {
            summary.bibite[line.item_name] = (summary.bibite[line.item_name] || 0) + line.quantity
          }
        }
      })
    })

    const orders_by_slot = Object.values(slotsMap).sort((a: any, b: any) => a.slot.time.localeCompare(b.slot.time))

    return NextResponse.json({
      orders_by_slot,
      financials: { expected_revenue, already_paid, cash_pending, cash_received }
    })
  } catch (error) {
    console.error('Errore nel dashboard:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
