"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, MapPin, Power } from "lucide-react";
import Link from "next/link";

export default function SediListPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadSites = async () => {
    setLoading(true);
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*, delivery_slots(id, label, delivery_time, is_active)')
      .order('sort_order');
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, site_id');

    if (sitesData) {
      setSites(sitesData.map(site => ({
        ...site,
        slots: site.delivery_slots || [],
        ordersCount: ordersData?.filter(o => o.site_id === site.id).length || 0,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadSites(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('sites').update({ is_active: !current }).eq('id', id);
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
          <h1 className="text-2xl font-bold text-[#14213D]">Punti di Consegna</h1>
          <p className="text-gray-500 text-sm">I giorni di apertura si impostano in <a href="/admin/impostazioni" className="text-blue-500 hover:underline">Impostazioni</a>. Qui gestisci i luoghi e gli orari dei turni.</p>
        </div>
        <Link
          href="/admin/sedi/nuova"
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Aggiungi punto
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Caricamento...</div>
      ) : (
        <div className="space-y-4">
          {sites.map(site => (
            <div
              key={site.id}
              className={`bg-white rounded-xl shadow-sm border p-5 ${!site.is_active ? 'opacity-60 bg-gray-50' : 'border-gray-200'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
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
                    {/* Orari turni */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {site.slots.length === 0 && (
                        <span className="text-xs text-orange-500 font-medium">⚠ Nessun orario configurato</span>
                      )}
                      {site.slots.map((s: any) => (
                        <span key={s.id} className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500 line-through'}`}>
                          {s.label} · {s.delivery_time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/sedi/${site.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded font-medium flex items-center gap-1 text-sm border border-blue-200"
                  >
                    <Edit2 size={16} /> Modifica orari
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
                    title={site.ordersCount > 0 ? `${site.ordersCount} ordini collegati` : ''}
                    className={`p-2 rounded font-medium flex items-center gap-1 text-sm border ${site.ordersCount > 0 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                  >
                    <Trash2 size={16} /> Elimina
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span>{site.slots.length} orari di turno</span>
                <span>{site.ordersCount} ordini totali</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
