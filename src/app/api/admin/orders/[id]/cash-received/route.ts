import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value }
      }
    }
  )

  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const supabase = createAdminClient()
  
  // Verify admin rights for the order's company
  const { data: order } = await supabase.from('orders').select('company_id').eq('id', params.id).single()
  if (!order) return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })

  const { data: adminRole } = await supabase.from('admins').select('*').eq('user_id', session.user.id).eq('company_id', order.company_id).single()
  if (!adminRole) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

  const { data: updatedOrder, error } = await supabase
    .from('orders')
    .update({ payment_status: 'cash_received' })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Errore durante l\'aggiornamento' }, { status: 500 })
  return NextResponse.json({ order: updatedOrder })
}
