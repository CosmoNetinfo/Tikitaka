"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Power, Trash2, AlertCircle } from "lucide-react";

export default function FuoriMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getSupabase = () => createClient();

  const loadItems = async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('special_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error("Load error:", error.message, error.code);
    if (data) setItems(data);
    else setItems([]);
  };

  useEffect(() => {
    // Wait for auth session to hydrate before querying
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) loadItems();
    });
    // Also try immediately in case session is already ready
    loadItems();
    return () => subscription.unsubscribe();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('special_items')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (error) alert("Errore: " + error.message);
    else loadItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo articolo?")) return;
    const supabase = getSupabase();
    const { error } = await supabase.from('special_items').delete().eq('id', id);
    if (error) alert("Errore eliminazione: " + error.message);
    else loadItems();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError("");
    const fd = new FormData(e.currentTarget);

    let imageUrl = editingItem?.image_url || null;
    const fileInput = fd.get("photo") as File;
    if (fileInput && fileInput.size > 0) {
      const buffer = await fileInput.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      imageUrl = "data:" + fileInput.type + ";base64," + btoa(binary);
    }

    const priceRaw = fd.get("price") as string;
    const priceCents = Math.round(parseFloat(priceRaw) * 100);

    const payload: any = {
      company_id: "11111111-1111-1111-1111-111111111111",
      name: fd.get("name"),
      description: fd.get("desc") || "",
      image_url: imageUrl,
      price_cents: priceCents,
      available_dates: ["2026-10-06"],
      is_active: true,
    };

    const supabase = getSupabase();

    // Verify session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      setSaveError("Sessione scaduta. Effettua di nuovo il login.");
      return;
    }

    let error;
    if (editingItem) {
      const res = await supabase.from('special_items').update(payload).eq('id', editingItem.id);
      error = res.error;
    } else {
      const res = await supabase.from('special_items').insert(payload);
      error = res.error;
    }

    if (error) {
      setSaveError("Errore salvataggio: " + error.message + " (code: " + error.code + ")");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsFormOpen(false);
      loadItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Fuori Menu</h1>
          <p className="text-gray-500 text-sm">Gestisci i piatti speciali e le offerte temporanee.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setSaveError(""); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuovo Articolo
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Articolo salvato con successo!
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-lg border">
          Nessun articolo fuori menu presente. Clicca su &quot;Nuovo Articolo&quot; per iniziare.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${!item.is_active ? 'opacity-75 grayscale' : ''}`}>
              <div className="h-40 bg-gray-100 w-full relative flex items-center justify-center text-gray-400 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">Senza foto</span>
                )}
                <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full font-bold shadow ${item.is_active ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {item.is_active ? 'ATTIVO' : 'NON ATTIVO'}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-[#14213D] leading-tight">{item.name}</h3>
                  <span className="font-bold text-[#14213D] bg-yellow-100 px-2 py-1 rounded">
                    € {(item.price_cents / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description || "Nessuna descrizione"}</p>
                <div className="pt-2 border-t flex items-center gap-2">
                  <button onClick={() => { setEditingItem(item); setSaveError(""); setIsFormOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifica">
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
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Modifica Articolo" : "Nuovo Articolo"}</h2>

            {saveError && (
              <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input name="name" required defaultValue={editingItem?.name} className="w-full border p-2 rounded focus:ring-2 focus:ring-[#FFC300]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrizione</label>
                  <textarea name="desc" rows={3} defaultValue={editingItem?.description} className="w-full border p-2 rounded focus:ring-2 focus:ring-[#FFC300]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prezzo (€) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    defaultValue={editingItem ? (editingItem.price_cents / 100).toFixed(2) : ""}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#FFC300]"
                    placeholder="es. 8.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Foto Piatto</label>
                  {editingItem?.image_url && (
                    <img src={editingItem.image_url} alt="Foto attuale" className="w-24 h-24 object-cover rounded mb-2" />
                  )}
                  <input type="file" name="photo" accept="image/*" className="w-full border p-2 rounded text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Lascia vuoto per mantenere la foto attuale</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Annulla
                </button>
                <button type="submit" className="px-4 py-2 bg-[#FFC300] text-[#14213D] font-bold rounded hover:bg-[#e6b000]">
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
