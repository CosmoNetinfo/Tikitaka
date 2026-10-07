"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar as CalendarIcon, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { it } from "date-fns/locale";

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("all"); // 'all' means all sites
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const companyId = '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    loadData();
  }, [currentDate, selectedSite]);

  const loadData = async () => {
    setLoading(true);
    // Load sites
    const { data: sData } = await supabase.from('sites').select('id, name, delivery_weekdays').order('sort_order');
    if (sData) setSites(sData);

    // Load calendar overrides for this month
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    let query = supabase
      .from('calendar_days')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'));

    if (selectedSite === 'all') {
      query = query.is('site_id', null);
    } else {
      query = query.eq('site_id', selectedSite);
    }

    const { data: cData } = await query;
    if (cData) setCalendarDays(cData);
    
    setLoading(false);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const override = calendarDays.find(c => c.date === dateStr);
    
    if (override) {
      return override;
    }
    
    // Automatic logic
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    let isOpen = false;
    
    if (selectedSite === 'all') {
      // If "all sites" is selected, we assume open if any site is open? Or default Mon-Fri
      isOpen = [1,2,3,4,5].includes(dayOfWeek);
    } else {
      const site = sites.find(s => s.id === selectedSite);
      isOpen = site?.delivery_weekdays?.includes(dayOfWeek) ?? false;
    }
    
    return { status: 'auto', isOpen, reason: null };
  };

  const handleDayClick = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = getDayStatus(date);
    
    let newStatus = '';
    let reason = null;

    if (currentStatus.status === 'auto') {
      newStatus = currentStatus.isOpen ? 'closed' : 'open';
    } else if (currentStatus.status === 'open') {
      newStatus = 'closed';
    } else if (currentStatus.status === 'closed') {
      newStatus = 'auto'; // Reset to auto
    }

    if (newStatus === 'closed') {
      // Check if there are orders for this day
      let ordersQuery = supabase.from('orders').select('id', { count: 'exact' }).eq('delivery_date', dateStr).neq('status', 'cancelled');
      if (selectedSite !== 'all') {
        ordersQuery = ordersQuery.eq('site_id', selectedSite);
      }
      
      const { count } = await ordersQuery;
      
      if (count && count > 0) {
        if (!confirm(`ATTENZIONE: Ci sono ${count} ordini per il ${format(date, 'dd/MM/yyyy')}. Vuoi chiudere comunque la giornata? Gli ordini non verranno cancellati automaticamente.`)) {
          return;
        }
      }
      
      const r = prompt("Motivo della chiusura (es. Ferie, opzionale):");
      reason = r || null;
    }

    const siteId = selectedSite === 'all' ? null : selectedSite;

    if (newStatus === 'auto') {
      // Delete override
      await supabase.from('calendar_days').delete()
        .eq('company_id', companyId)
        .eq('date', dateStr)
        .is('site_id', siteId);
    } else {
      // Upsert override
      const { data: existing } = await supabase.from('calendar_days').select('id')
        .eq('company_id', companyId)
        .eq('date', dateStr)
        .is('site_id', siteId)
        .single();
        
      if (existing) {
        await supabase.from('calendar_days').update({ status: newStatus, reason }).eq('id', existing.id);
      } else {
        await supabase.from('calendar_days').insert({
          company_id: companyId,
          site_id: siteId,
          date: dateStr,
          status: newStatus,
          reason
        });
      }
    }
    
    loadData(); // Reload
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <CalendarIcon /> Calendario Aperture
          </h1>
          <p className="text-gray-500 text-sm">Forza aperture o chiusure per giorni specifici.</p>
        </div>
        
        <select 
          value={selectedSite} 
          onChange={e => setSelectedSite(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#FFC300] outline-none"
        >
          <option value="all">Tutte le sedi</option>
          {sites.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
          <h2 className="text-xl font-bold capitalize">{format(currentDate, 'MMMM yyyy', { locale: it })}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ArrowRight /></button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
            <div key={d} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700">{d}</div>
          ))}
          
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const status = getDayStatus(day);
            
            let bgClass = "bg-white hover:bg-gray-50";
            if (!isCurrentMonth) bgClass = "bg-gray-50 text-gray-400";
            else if (status.status === 'closed') bgClass = "bg-red-50 hover:bg-red-100 border-2 border-red-200";
            else if (status.status === 'open') bgClass = "bg-green-50 hover:bg-green-100 border-2 border-green-200";
            else if (!status.isOpen) bgClass = "bg-gray-100 text-gray-400"; // Auto closed
            
            return (
              <div 
                key={i} 
                onClick={() => isCurrentMonth && handleDayClick(day)}
                className={`min-h-[100px] p-2 cursor-pointer transition-colors relative ${bgClass} ${isToday(day) ? 'font-bold' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-[#14213D] text-white' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {status.status !== 'auto' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.status === 'closed' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                      {status.status === 'closed' ? 'Chiuso' : 'Aperto'}
                    </span>
                  )}
                </div>
                
                {status.reason && (
                  <p className="text-xs text-red-600 mt-2 line-clamp-2 leading-tight">
                    {status.reason}
                  </p>
                )}
                {status.status === 'auto' && (
                  <p className="text-[10px] text-gray-400 mt-4 text-center">
                    {status.isOpen ? 'Regolare' : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border rounded"></div> Automatico (Aperto/Chiuso base)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div> Aperto (Forzato)</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div> Chiuso (Forzato)</div>
        </div>
      </div>
    </div>
  );
}
