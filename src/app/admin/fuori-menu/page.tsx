"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Power, Trash2 } from "lucide-react";

export default function FuoriMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const supabase = createClient();
  const companyId = "11111111-1111-1111-1111-111111111111"; // Tecnokar

  const loadItems = async () => {
    const { data } = await supabase.from('special_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('special_items').update({ is_active: !currentStatus }).eq('id', id);
    loadItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo articolo?")) return;
    await supabase.from('special_items').delete().eq('id', id);
    loadItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Fuori Menu</h1>
          <p className="text-gray-500 text-sm">Gestisci i piatti speciali e le offerte temporanee.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuovo Articolo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-lg border">
          Nessun articolo fuori menu presente. Clicca su "Nuovo Articolo" per iniziare.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${!item.is_active ? 'opacity-75 grayscale' : ''}`}>
              <div className="h-32 bg-gray-100 w-full relative flex items-center justify-center text-gray-400">
                {item.is_active ? (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">ATTIVO</div>
                ) : (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">NON ATTIVO</div>
                )}
                <span className="text-sm">Senza foto</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-[#14213D] leading-tight">{item.name}</h3>
                  <span className="font-bold text-[#14213D] bg-yellow-100 px-2 py-1 rounded">€ {(item.price_cents / 100).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description || "Nessuna descrizione"}</p>
                
                <div className="pt-2 border-t flex items-center justify-between">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifica">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => toggleActive(item.id, item.is_active)} className={`p-1.5 rounded ${item.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`} title={item.is_active ? "Disattiva" : "Riattiva"}>
                      <Power size={16} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Elimina">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Modifica Articolo" : "Nuovo Articolo"}</h2>
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
                name: fd.get("name"),
                description: fd.get("desc"),
                image_url: base64Image || null,
                price_cents: Math.round(parseFloat(fd.get("price") as string) * 100),
                available_dates: ['2026-10-06'],
                is_active: true
              };
              if (editingItem) {
                await supabase.from('special_items').update(payload).eq('id', editingItem.id);
              } else {
                await supabase.from('special_items').insert(payload);
              }
              setIsFormOpen(false);
              loadItems();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Nome</label>
                  <input name="name" required defaultValue={editingItem?.name} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Descrizione</label>
                  <textarea name="desc" defaultValue={editingItem?.description} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Prezzo (€)</label>
                  <input name="price" type="number" step="0.10" required defaultValue={editingItem ? (editingItem.price_cents / 100).toFixed(2) : ""} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Foto Piatto</label>
                  <input type="file" name="photo" accept="image/*" className="w-full border p-2 rounded text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded">Annulla</button>
                <button type="submit" className="px-4 py-2 bg-[#FFC300] font-bold rounded">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
