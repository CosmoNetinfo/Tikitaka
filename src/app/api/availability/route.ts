export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, isAfter, subDays, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Leggi le impostazioni globali di Tiki Taka (giorni apertura, orario cutoff)
  const { data: settings } = await supabase
    .from('company_settings')
    .select('delivery_weekdays, order_cutoff_time')
    .eq('company_id', COMPANY_ID)
    .maybeSingle();

  const activeWeekdays: number[] = settings?.delivery_weekdays || [1, 2, 3, 4, 5];
  const cutoffTime: string = settings?.order_cutoff_time || '14:00';
  const [cutoffHour, cutoffMin] = cutoffTime.split(':').map(Number);

  // Leggi eccezioni calendario per questa sede o globali
  const today = startOfDay(new Date());
  const limitDate = addDays(today, 21);

  let calendarQuery = supabase
    .from('calendar_days')
    .select('date, status, reason')
    .eq('company_id', COMPANY_ID)
    .gte('date', format(today, 'yyyy-MM-dd'))
    .lte('date', format(limitDate, 'yyyy-MM-dd'));

  if (siteId) {
    calendarQuery = calendarQuery.or(`site_id.eq.${siteId},site_id.is.null`);
  } else {
    calendarQuery = calendarQuery.is('site_id', null);
  }

  const { data: calendarDays } = await calendarQuery;
  const calMap: Record<string, { status: string; reason?: string }> = {};
  for (const cd of calendarDays || []) {
    calMap[cd.date] = { status: cd.status, reason: cd.reason };
  }

  const availableDates: any[] = [];

  for (let i = 0; i < 21 && availableDates.filter(d => d.isOpen).length < 5; i++) {
    const d = addDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dow = d.getDay() === 0 ? 7 : d.getDay(); // 1=Lun, 7=Dom

    const override = calMap[dateStr];

    let isOpen: boolean;
    let reason: string | null = null;

    if (override) {
      isOpen = override.status === 'open';
      if (!isOpen) reason = override.reason || 'Chiuso';
    } else {
      isOpen = activeWeekdays.includes(dow);
    }

    if (!isOpen && !override) continue; // skip silently normal closed days

    // Verifica cutoff
    let cutoffDay = subDays(d, dow === 1 ? 2 : 1); // Lunedì -> sabato precedente
    const cutoff = new Date(cutoffDay);
    cutoff.setHours(cutoffHour, cutoffMin, 0, 0);
    const isCutoffPassed = isAfter(new Date(), cutoff);

    if (isCutoffPassed) {
      isOpen = false;
      reason = 'Orario limite passato';
    }

    availableDates.push({
      date: dateStr,
      formattedDate: format(d, 'EEEE d MMMM', { locale: it }),
      isOpen,
      reason,
    });
  }

  return NextResponse.json({ availableDates });
}
