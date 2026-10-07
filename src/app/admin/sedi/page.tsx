"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, MapPin, Power } from "lucide-react";
import Link from "next/link";

const GIORNI = [
  { id: 1, label: "Lun" }, { id: 2, label: "Mar" }, { id: 3, label: "Mer" },
  { id: 4, label: "Gio" }, { id: 5, label: "Ven" }, { id: 6, label: "Sab" }, { id: 7, label: "Dom" }
];

export default function SediListPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();

  const loadSites = async () => {
    setLoading(true);
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*, delivery_slots(id)')
      .order('sort_order');
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, site_id');

    if (sitesData) {
      setSites(sitesData.map(site => ({
        ...site,
        slotsCount: site.delivery_slots?.length || 0,
        ordersCount: ordersData?.filter(o => o.site_id === site.id).length || 0,
        delivery_weekdays: site.delivery_weekdays || [1,2,3,4,5]
      })).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    }
    setLoading(false);
  };

  useEffect(() => { loadSites(); }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('sites').update({ is_active: !currentStatus }).eq('id', id);
    loadSites();
  };

  const toggleWeekday = async (siteId: string, dayId: number, currentDays: number[]) => {
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId].sort((a, b) => a - b);
    setSaving(siteId);
    await supabase.from('sites').update({ delivery_weekdays: newDays }).eq('id', siteId);
    setSaving(null);
    loadSites();
  };

  const deleteSite = async (id: string, ordersCount: number) => {
    if (ordersCount > 0) {
      alert(`Impossibile eliminare: ci sono ${ordersCount} ordini collegati. Usa Disattiva.`);
      return;
    }
    if (!confirm("Sei sicuro di voler eliminare questa sede?")) return;
    await supabase.from('sites').delete().eq('id', id);
    loadSites();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Gestione Sedi</h1>
          <p className="text-gray-500 text-sm">Configura le sedi di consegna, i giorni attivi e gli orari.</p>
        </div>
        <Link
          href="/admin/sedi/nuova"
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Aggiungi sede
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Caricamento sedi...</div>
      ) : (
        <div className="space-y-4">
          {sites.map(site => (
            <div
              key={site.id}
              className={`bg-white rounded-xl shadow-sm border p-5 transition-colors ${!site.is_active ? 'opacity-60 bg-gray-50' : 'border-gray-200'}`}
            >
              {/* Header sede */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${site.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#14213D] flex items-center gap-2">
                      {site.name}
                      {!site.is_active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Disattivata</span>}
                    </h3>
                    <p className="text-sm text-gray-500">{site.delivery_point_text || 'Luogo non specificato'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/sedi/${site.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded font-medium flex items-center gap-1 text-sm border border-blue-200"
                  >
                    <Edit2 size={16} /> Orari & dettagli
                  </Link>
                  <button
                    onClick={() => toggleActive(site.id, site.is_active)}
                    className={`p-2 rounded font-medium flex items-center gap-1 text-sm border ${site.is_active ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                  >
                    <Power size={16} /> {site.is_active ? "Disattiva" : "Attiva"}
                  </button>
                  <button
                    onClick={() => deleteSite(site.id, site.ordersCount)}
                    disabled={site.ordersCount > 0}
                    className={`p-2 rounded font-medium flex items-center gap-1 text-sm border ${site.ordersCount > 0 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} /> Elimina
                  </button>
                </div>
              </div>

              {/* Giorni settimanali */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Giorni di consegna {saving === site.id && <span className="text-blue-500 normal-case">Salvataggio...</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {GIORNI.map(g => {
                    const isActive = (site.delivery_weekdays || []).includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleWeekday(site.id, g.id, site.delivery_weekdays)}
                        disabled={saving === site.id}
                        className={`w-12 h-10 rounded-lg text-sm font-bold transition-colors border-2 ${
                          isActive
                            ? 'bg-[#14213D] text-white border-[#14213D]'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statistiche */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                <span>{site.slotsCount} orari configurati</span>
                <span>{site.ordersCount} ordini totali</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
