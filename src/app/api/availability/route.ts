import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { toZonedTime, format } from 'date-fns-tz'
import { addDays, isWeekend, parseISO, startOfDay, isBefore } from 'date-fns'

function isCutoffPassed(deliveryDateStr: string, cutoffTime: string = '14:00'): boolean {
  const TIMEZONE = 'Europe/Rome'
  const now = new Date()
  const nowZoned = toZonedTime(now, TIMEZONE)
  
  const deliveryDate = parseISO(deliveryDateStr)
  let cutoffDate = addDays(deliveryDate, -1)
  
  // If delivery is Monday (1), cutoff is Saturday (6), which is 2 days before
  if (deliveryDate.getDay() === 1) {
    cutoffDate = addDays(deliveryDate, -2)
  }
  
  const [hours, minutes] = cutoffTime.split(':').map(Number)
  cutoffDate.setHours(hours, minutes, 0, 0)
  
  return isBefore(nowZoned, cutoffDate) === false // passed if now is after cutoff
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const companySlug = searchParams.get('company')

  if (!companySlug) {
    return NextResponse.json({ error: 'Manca lo slug dell\'azienda' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*, company_settings(*), delivery_slots(*)')
      .eq('slug', companySlug)
      .eq('is_active', true)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Azienda non trovata o inattiva' }, { status: 404 })
    }

    const settings = company.company_settings[0]
    const closedDays = settings?.closed_days || []
    const cutoffTime = settings?.cutoff_time || '14:00'

    // Calculate next 5 available weekdays
    const availableDates: string[] = []
    let currentDate = new Date()
    
    while (availableDates.length < 5) {
      currentDate = addDays(currentDate, 1)
      if (isWeekend(currentDate)) continue
      
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      if (closedDays.includes(dateStr)) continue
      
      if (!isCutoffPassed(dateStr, cutoffTime)) {
        availableDates.push(dateStr)
      }
      
      // Stop looking too far ahead (e.g. max 30 days)
      if (addDays(new Date(), 30) < currentDate) break;
    }

    const { data: specialItems } = await supabase
      .from('special_items')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_active', true)

    // Group special items by date
    const specialItemsByDate = availableDates.reduce((acc, date) => {
      acc[date] = (specialItems || []).filter(item => 
        !item.available_dates || item.available_dates.includes(date)
      )
      return acc
    }, {} as Record<string, any[]>)

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)

    const menuByCategory = (menuItems || []).reduce((acc, item) => {
      const cat = item.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {} as Record<string, any[]>)

    const { data: combos } = await supabase
      .from('combos')
      .select('*')
      .eq('is_active', true)

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug
      },
      settings,
      slots: company.delivery_slots.filter((s: any) => s.is_active),
      availableDates,
      specialItemsByDate,
      menuByCategory,
      combos
    })
  } catch (error) {
    console.error('Errore in availability:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
