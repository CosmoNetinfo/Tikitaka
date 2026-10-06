"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, MapPin, GripVertical, Power } from "lucide-react";
import Link from "next/link";

export default function SediListPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadSites = async () => {
    setLoading(true);
    // Fetch sites and count of slots per site
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*, delivery_slots(id)');
    
    // Also fetch orders to check if a site has orders connected
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, site_id');

    if (sitesData) {
      const sitesWithCounts = sitesData.map(site => ({
        ...site,
        slotsCount: site.delivery_slots?.length || 0,
        ordersCount: ordersData?.filter(o => o.site_id === site.id).length || 0
      })).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setSites(sitesWithCounts);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('sites')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) loadSites();
  };

  const deleteSite = async (id: string, ordersCount: number) => {
    if (ordersCount > 0) {
      alert(`Impossibile eliminare: ci sono ${ordersCount} ordini collegati. Usa l'opzione Disattiva.`);
      return;
    }
    if (!confirm("Sei sicuro di voler eliminare questa sede?")) return;
    const { error } = await supabase.from('sites').delete().eq('id', id);
    if (error) alert("Errore eliminazione: " + error.message);
    else loadSites();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Gestione Sedi</h1>
          <p className="text-gray-500 text-sm">Aggiungi e configura le sedi di consegna e i loro orari.</p>
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
            <div key={site.id} className={`bg-white rounded-lg shadow-sm border p-5 flex items-center justify-between transition-colors ${!site.is_active ? 'opacity-75 grayscale bg-gray-50' : 'border-gray-200 hover:border-[#FFC300]'}`}>
              <div className="flex items-center gap-4">
                <GripVertical className="text-gray-400 cursor-move" size={24} />
                <div className={`p-3 rounded-full ${site.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#14213D] flex items-center gap-2">
                    {site.name}
                    {!site.is_active && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Disattivata</span>}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Luogo: {site.delivery_point_text || 'Non specificato'}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs font-medium text-gray-500">
                    <span>{site.slotsCount} orari di consegna</span>
                    <span>{site.ordersCount} ordini collegati</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  href={`/admin/sedi/${site.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded font-medium flex items-center gap-1"
                >
                  <Edit2 size={18} /> Modifica
                </Link>
                <button 
                  onClick={() => toggleActive(site.id, site.is_active)} 
                  className={`p-2 rounded font-medium flex items-center gap-1 ${site.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  <Power size={18} /> {site.is_active ? "Disattiva" : "Attiva"}
                </button>
                <button 
                  onClick={() => deleteSite(site.id, site.ordersCount)} 
                  className={`p-2 rounded font-medium flex items-center gap-1 ${site.ordersCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                  title={site.ordersCount > 0 ? `Ci sono ${site.ordersCount} ordini collegati. Usa Disattiva.` : "Elimina"}
                >
                  <Trash2 size={18} /> Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
