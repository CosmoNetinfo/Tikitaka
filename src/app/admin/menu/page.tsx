"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Plus, GripVertical, Trash2 } from "lucide-react";

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("primo_formato");
  const [items, setItems] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const supabase = createClient();
  const companyId = "11111111-1111-1111-1111-111111111111";

  const load = async () => {
    const { data: i } = await supabase.from('menu_items').select('*').order('sort_order');
    const { data: c } = await supabase.from('combos').select('*').order('id');
    if (i) setItems(i);
    if (c) setCombos(c);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteItem = async (id: string) => {
    if (!confirm("Eliminare elemento?")) return;
    await supabase.from('menu_items').delete().eq('id', id);
    load();
  };

  const tabs = [
    { id: "primo_formato", label: "Formati Pasta" },
    { id: "primo_condimento", label: "Condimenti" },
    { id: "secondo", label: "Secondi" },
    { id: "contorno", label: "Contorni" },
    { id: "bibita", label: "Bibite" },
    { id: "prezzi", label: "Prezzi Combo" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Menu e Prezzi</h1>
          <p className="text-gray-500 text-sm">Gestisci il menu fisso e le configurazioni dei prezzi.</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-[#FFC300] text-[#14213D]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab !== "prezzi" ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#14213D]">
                Elenco {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="flex items-center gap-2 bg-[#14213D] text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition-colors">
                <Plus size={16} />
                Aggiungi
              </button>
            </div>
            
            <div className="space-y-3">
              {items.filter(i => i.category === activeTab).length === 0 && (
                <div className="p-4 text-center text-gray-400 border rounded-lg">Nessun elemento presente in questa categoria.</div>
              )}
              {items.filter(i => i.category === activeTab).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <GripVertical className="text-gray-400 cursor-move" size={20} />
                    <div className="w-12 h-12 bg-gray-100 rounded object-cover flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                         <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xs text-gray-400">No Foto</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#14213D]">{item.name}</h4>
                      <p className="text-xs text-gray-500">Allergeni: {item.allergens || 'Nessuno'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="text-blue-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-[#14213D] mb-4">Configurazione Prezzi Combo</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combinazione</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo (€)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {combos.map(combo => (
                    <tr key={combo.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{combo.label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Combo</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        <input type="number" id={`combo-${combo.id}`} defaultValue={(combo.price_cents / 100).toFixed(2)} step="0.50" className="w-20 px-2 py-1 border rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={async () => {
                          const val = (document.getElementById(`combo-${combo.id}`) as HTMLInputElement).value;
                          await supabase.from('combos').update({ price_cents: Math.round(parseFloat(val)*100) }).eq('id', combo.id);
                          alert("Prezzo salvato!");
                        }} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">Salva</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Modifica Elemento" : "Nuovo Elemento"} in {tabs.find(t => t.id === activeTab)?.label}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              let base64Image = editingItem?.image_url || "";
              
              const fileInput = fd.get("photo") as File;
              if (fileInput && fileInput.size > 0) {
                 const buffer = await fileInput.arrayBuffer();
                 const bytes = new Uint8Array(buffer);
                 let binary = '';
                 for (let i = 0; i < bytes.byteLength; i++) {
                     binary += String.fromCharCode(bytes[i]);
                 }
                 base64Image = 'data:' + fileInput.type + ';base64,' + btoa(binary);
              }

              const payload = {
                company_id: companyId,
                category: activeTab,
                name: fd.get("name"),
                allergens: fd.get("allergens"),
                image_url: base64Image || null,
                is_active: true,
                sort_order: editingItem ? editingItem.sort_order : items.length
              };

              if (editingItem) {
                 const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
                 if (error) alert("Errore modifica: " + error.message);
              } else {
                 const { error } = await supabase.from('menu_items').insert(payload);
                 if (error) alert("Errore creazione: " + error.message);
              }
              setIsFormOpen(false);
              load();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Nome</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full border p-2 rounded" placeholder="es. Penne al pomodoro" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Allergeni (opzionale)</label>
                  <input name="allergens" defaultValue={editingItem?.allergens} className="w-full border p-2 rounded" placeholder="es. Glutine, Lattosio" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Foto Piatto</label>
                  <input type="file" name="photo" accept="image/*" className="w-full border p-2 rounded text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded">Annulla</button>
                <button type="submit" className="px-4 py-2 bg-[#14213D] text-white font-bold rounded">Salva Elemento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
