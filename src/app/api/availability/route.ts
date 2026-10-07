export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { startOfDay, addDays, format, isBefore, isAfter, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const companyId = searchParams.get('companyId') || '11111111-1111-1111-1111-111111111111';

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get site info
  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single();
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

  // Get calendar days for this site and null site (all sites)
  const { data: calendarDays } = await supabase
    .from('calendar_days')
    .select('*')
    .eq('company_id', companyId)
    .or(`site_id.eq.${siteId},site_id.is.null`);

  const activeWeekdays = site.delivery_weekdays || [1, 2, 3, 4, 5]; // Default Mon-Fri
  
  const today = new Date();
  const availableDates = [];

  // Generate next 14 days
  for (let i = 0; i < 14; i++) {
    const d = addDays(startOfDay(today), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon, 7=Sun

    // Check calendar overrides
    const siteOverride = calendarDays?.find(c => c.date === dateStr && c.site_id === siteId);
    const globalOverride = calendarDays?.find(c => c.date === dateStr && c.site_id === null);
    
    const override = siteOverride || globalOverride;

    let isOpen = activeWeekdays.includes(dayOfWeek);
    let reason = null;

    if (override) {
      if (override.status === 'closed') {
        isOpen = false;
        reason = override.reason || 'Chiuso';
      } else if (override.status === 'open') {
        isOpen = true;
      }
    }

    if (!isOpen) continue;

    // Check cutoff (14:00 day before, for Monday it's Saturday 14:00)
    let cutoffDay = subDays(d, 1);
    if (dayOfWeek === 1) { // Monday -> Saturday cutoff
      cutoffDay = subDays(d, 2);
    }
    
    const cutoffTime = new Date(cutoffDay);
    cutoffTime.setHours(14, 0, 0, 0);

    const isCutoffPassed = isAfter(new Date(), cutoffTime);

    availableDates.push({
      date: dateStr,
      formattedDate: format(d, 'EEEE d MMMM', { locale: it }),
      isOpen: !isCutoffPassed,
      isCutoffPassed,
      reason: isCutoffPassed ? 'Orario limite passato' : reason
    });

    if (availableDates.filter(x => x.isOpen).length >= 5) {
      break; // Stop after finding 5 open days
    }
  }

  return NextResponse.json({ availableDates });
}
