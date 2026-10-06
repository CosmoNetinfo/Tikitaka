"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function SedeEditPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'nuova';
  const siteId = isNew ? null : params.id;
  
  const [site, setSite] = useState<any>({
    name: "",
    delivery_point_text: "",
    is_active: true,
    delivery_weekdays: [1, 2, 3, 4, 5] // 1=Mon, 5=Fri
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [closedDays, setClosedDays] = useState<any[]>([]);
  
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const supabase = createClient();

  useEffect(() => {
    if (!isNew && siteId) {
      loadData();
    }
  }, [siteId]);

  const loadData = async () => {
    const { data: s } = await supabase.from('sites').select('*').eq('id', siteId).single();
    const { data: sl } = await supabase.from('delivery_slots').select('*').eq('site_id', siteId).order('sort_order');
    const { data: cd } = await supabase.from('closed_days').select('*').eq('site_id', siteId).order('day');
    
    if (s) {
      // Parse weekdays if they exist, otherwise default
      if (!s.delivery_weekdays) s.delivery_weekdays = [1, 2, 3, 4, 5];
      setSite(s);
    }
    if (sl) setSlots(sl);
    if (cd) setClosedDays(cd);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site.name.trim()) {
      alert("Il nome della sede è obbligatorio");
      return;
    }

    try {
      let currentSiteId = siteId;
      
      // Save Site
      if (isNew) {
        const { data, error } = await supabase.from('sites').insert({
          name: site.name,
          delivery_point_text: site.delivery_point_text,
          delivery_weekdays: site.delivery_weekdays,
          is_active: site.is_active
        }).select().single();
        if (error) throw error;
        currentSiteId = data.id;
      } else {
        const { error } = await supabase.from('sites').update({
          name: site.name,
          delivery_point_text: site.delivery_point_text,
          delivery_weekdays: site.delivery_weekdays,
          is_active: site.is_active
        }).eq('id', currentSiteId);
        if (error) throw error;
      }

      // Save Slots
      // First, get existing slots for this site
      const { data: existingSlots } = await supabase.from('delivery_slots').select('id').eq('site_id', currentSiteId);
      const existingIds = existingSlots?.map(s => s.id) || [];
      const currentSlotIds = slots.filter(s => s.id).map(s => s.id);
      
      // Delete removed slots
      const slotsToRemove = existingIds.filter(id => !currentSlotIds.includes(id));
      if (slotsToRemove.length > 0) {
        // Check orders before delete
        const { data: orders } = await supabase.from('orders').select('id').in('slot_id', slotsToRemove);
        if (orders && orders.length > 0) {
           alert("Alcuni orari non possono essere eliminati perché hanno ordini collegati. Verranno disattivati.");
           await supabase.from('delivery_slots').update({ is_active: false }).in('id', slotsToRemove);
        } else {
           await supabase.from('delivery_slots').delete().in('id', slotsToRemove);
        }
      }

      // Upsert current slots
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (slot.id) {
          await supabase.from('delivery_slots').update({
            label: slot.label,
            delivery_time: slot.delivery_time,
            sort_order: i,
            is_active: slot.is_active !== false
          }).eq('id', slot.id);
        } else {
          await supabase.from('delivery_slots').insert({
            site_id: currentSiteId,
            company_id: '11111111-1111-1111-1111-111111111111', // Still need company_id for FK
            label: slot.label,
            delivery_time: slot.delivery_time,
            sort_order: i,
            is_active: true
          });
        }
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (isNew) router.push('/admin/sedi');
      }, 2000);
      
    } catch (err: any) {
      alert("Errore durante il salvataggio: " + err.message);
    }
  };

  const toggleWeekday = (dayNumber: number) => {
    const current = site.delivery_weekdays || [];
    if (current.includes(dayNumber)) {
      setSite({ ...site, delivery_weekdays: current.filter(d => d !== dayNumber) });
    } else {
      setSite({ ...site, delivery_weekdays: [...current, dayNumber].sort() });
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/sedi" className="p-2 bg-white rounded-full border shadow-sm hover:bg-gray-50">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">{isNew ? 'Nuova Sede' : 'Modifica Sede'}</h1>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSave}>
        {/* Dati Base */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4 border-b pb-2">Dati Principali</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Sede *</label>
              <input type="text" required value={site.name} onChange={e => setSite({...site, name: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" placeholder="Es. Tecnokar 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Luogo di Consegna (mostrato al cliente)</label>
              <input type="text" value={site.delivery_point_text || ""} onChange={e => setSite({...site, delivery_point_text: e.target.value})} className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" placeholder="Es. Ingresso Principale" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Giorni della settimana attivi per questa sede</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 1, label: "Lun" }, { id: 2, label: "Mar" }, { id: 3, label: "Mer" },
                  { id: 4, label: "Gio" }, { id: 5, label: "Ven" }, { id: 6, label: "Sab" }, { id: 7, label: "Dom" }
                ].map((giorno) => (
                  <label key={giorno.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer transition-colors ${
                    (site.delivery_weekdays || []).includes(giorno.id) ? 'bg-[#14213D] text-white border-[#14213D]' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}>
                    <input type="checkbox" className="hidden" checked={(site.delivery_weekdays || []).includes(giorno.id)} onChange={() => toggleWeekday(giorno.id)} />
                    <span className="text-sm font-medium">{giorno.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <h3 className="font-medium text-gray-900">Sede Attiva</h3>
                <p className="text-sm text-gray-500">Se disattivata, non compare nell'app e non accetta ordini.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={site.is_active} onChange={e => setSite({...site, is_active: e.target.checked})} />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Orari di consegna */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-semibold text-[#14213D]">Orari di Consegna (Turni)</h2>
            <button type="button" onClick={() => setSlots([...slots, { label: "Nuovo turno", delivery_time: "12:00", is_active: true }])} className="text-sm flex items-center gap-1 text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded">
              <Plus size={16} /> Aggiungi Orario
            </button>
          </div>
          
          <div className="space-y-3">
            {slots.length === 0 && <p className="text-gray-500 text-sm">Nessun orario configurato. Aggiungine almeno uno.</p>}
            {slots.map((fascia, i) => (
              <div key={fascia.id || i} className={`flex flex-wrap md:flex-nowrap items-center gap-3 p-3 border rounded-lg ${fascia.is_active === false ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                <div className="w-full md:w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">Nome Turno</label>
                  <input type="text" value={fascia.label} onChange={e => {
                    const ns = [...slots]; ns[i].label = e.target.value; setSlots(ns);
                  }} className="w-full px-3 py-2 border rounded-md" placeholder="es. Primo turno" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ora</label>
                  <input type="time" required value={fascia.delivery_time} onChange={e => {
                    const ns = [...slots]; ns[i].delivery_time = e.target.value; setSlots(ns);
                  }} className="w-32 px-3 py-2 border rounded-md font-mono" />
                </div>
                <div className="flex items-end gap-2 ml-auto mt-4 md:mt-0 pt-4 md:pt-0">
                  <button type="button" onClick={() => {
                    const ns = [...slots]; ns[i].is_active = !(ns[i].is_active !== false); setSlots(ns);
                  }} className="text-sm px-2 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    {fascia.is_active === false ? 'Riattiva' : 'Disattiva'}
                  </button>
                  <button type="button" onClick={() => {
                    const ns = [...slots]; ns.splice(i, 1); setSlots(ns);
                  }} className="text-red-500 hover:bg-red-50 p-2 border border-red-100 rounded" title="Elimina">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <Link href="/admin/sedi" className="px-6 py-2.5 border rounded-lg font-medium text-gray-700 hover:bg-gray-50">
            Annulla
          </Link>
          <button type="submit" className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-8 py-2.5 rounded-lg font-bold hover:bg-[#e6b000] transition-colors shadow-sm">
            <Save size={20} />
            Salva Sede
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <Save size={20} className="text-green-400" />
          <span>Sede salvata con successo!</span>
        </div>
      )}
    </div>
  );
}
