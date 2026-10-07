"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Plus, Trash2 } from "lucide-react";

export default function ImpostazioniPage() {
  const [showToast, setShowToast] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const supabase = createClient();
  const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

  useEffect(() => {
    async function load() {
      const { data: s, error } = await supabase.from('company_settings').select('*').eq('company_id', COMPANY_ID).maybeSingle();
      const { data: sl } = await supabase.from('delivery_slots').select('*').eq('company_id', COMPANY_ID).order('sort_order');
      
      if (s) {
        setSettings(s);
      } else {
        setSettings({
          company_id: COMPANY_ID,
          delivery_point_text: "Presso Tecnokar",
          order_cutoff_time: "14:00",
          cancel_until_time: "09:00",
          issuer_name: "Tiki Taka di Laura Simonelli",
          issuer_vat: "04034150542",
          issuer_address: "Via dei Vetrai 58, 06049 Spoleto (PG)",
          issuer_phone: "329 323 9693",
          issuer_email: "Laura.simonelli02@yahoo.com",
        });
      }
      if (sl) setSlots(sl);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      const { data } = await supabase.from('company_settings').select('company_id').eq('company_id', COMPANY_ID).maybeSingle();
      if (data) {
        await supabase.from('company_settings').update(settings).eq('company_id', COMPANY_ID);
      } else {
        await supabase.from('company_settings').insert(settings);
      }
    }
    for (const slot of slots) {
      if (slot.id) {
        await supabase.from('delivery_slots').update(slot).eq('id', slot.id);
      } else {
        await supabase.from('delivery_slots').insert({ ...slot, company_id: COMPANY_ID });
      }
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  if (!settings) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Impostazioni App</h1>
          <p className="text-gray-500 text-sm">Configura le regole di ordine, orari e pagamenti.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-6 py-2.5 rounded-lg font-bold hover:bg-[#e6b000] transition-colors shadow-sm"
        >
          <Save size={20} />
          Salva Modifiche
        </button>
      </div>

      <form className="space-y-8" onSubmit={handleSave}>
        {/* Section 1: Orari e Consegna */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4 border-b pb-2">Orari e Operatività</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orario Limite Ordini (giorno precedente)</label>
                <input type="time" value={settings.order_cutoff_time} onChange={e => setSettings({...settings, order_cutoff_time: e.target.value})} className="w-full md:w-1/2 px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orario Limite Annullamento (stesso giorno)</label>
                <input type="time" value={settings.cancel_until_time} onChange={e => setSettings({...settings, cancel_until_time: e.target.value})} className="w-full md:w-1/2 px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <div className="space-y-2 p-4 bg-gray-50 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">I giorni di consegna, gli orari (turni) e i luoghi di consegna sono ora gestiti per ogni singola sede.</p>
                <a href="/admin/sedi" className="inline-block text-sm font-medium text-blue-600 hover:underline">
                  Vai alla gestione Sedi &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pagamenti */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4 border-b pb-2">Metodi di Pagamento</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <h3 className="font-medium text-gray-900">Pagamento in Contanti</h3>
                <p className="text-sm text-gray-500">Permetti ai clienti di pagare alla consegna.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Pagamento con Carta (Stripe)</h3>
                  <p className="text-sm text-gray-500">Attiva i pagamenti online sicuri. Richiede chiavi Stripe nelle variabili d'ambiente.</p>
                  <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Chiavi Stripe non configurate — funzione disabilitata</p>
                </div>
                <label className="relative inline-flex items-center opacity-40 cursor-not-allowed">
                  <input type="checkbox" disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 opacity-40">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commissione Carta</label>
                  <select disabled className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="none">Nessuna maggiorazione</option>
                    <option value="fixed">Costo fisso (€)</option>
                    <option value="percent">Percentuale (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valore Commissione</label>
                  <input disabled type="number" step="0.01" defaultValue="0.50" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Ricevute */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-[#14213D] mb-4 border-b pb-2">Dati Titolare e Ricevute</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ragione Sociale / Nome Titolare</label>
              <input type="text" value={settings.issuer_name || ""} onChange={e => setSettings({...settings, issuer_name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA / Codice Fiscale</label>
              <input type="text" value={settings.issuer_vat || ""} onChange={e => setSettings({...settings, issuer_vat: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Sede</label>
              <input type="text" value={settings.issuer_address || ""} onChange={e => setSettings({...settings, issuer_address: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contatto Telefonico (per urgenze)</label>
              <input type="tel" value={settings.issuer_phone || ""} onChange={e => setSettings({...settings, issuer_phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={settings.issuer_email || ""} onChange={e => setSettings({...settings, issuer_email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Testo a piè di pagina (Ricevuta)</label>
              <textarea rows={3} value={settings.receipt_footer || ""} onChange={e => setSettings({...settings, receipt_footer: e.target.value})} className="w-full px-3 py-2 border rounded-md"></textarea>
            </div>
          </div>
        </section>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <Save size={20} className="text-green-400" />
          <span>Impostazioni salvate con successo!</span>
        </div>
      )}
    </div>
  );
}

