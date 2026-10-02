"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";

export default function ImpostazioniPage() {
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giorni di consegna attivi</label>
              <div className="flex flex-wrap gap-2">
                {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((giorno, i) => (
                  <label key={giorno} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded border cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" defaultChecked={i < 5} className="rounded text-[#14213D] focus:ring-[#FFC300]" />
                    <span className="text-sm">{giorno}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orario Limite Ordini (giorno precedente)</label>
                <input type="time" defaultValue="14:00" className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orario Limite Annullamento (stesso giorno)</label>
                <input type="time" defaultValue="09:00" className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Luogo di Consegna (Fisso)</label>
              <input type="text" defaultValue="Piazzale Azienda, Via Roma 123" className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fasce Orarie di Consegna (Turni)</label>
              <div className="space-y-2">
                {[
                  { label: "Primo Turno", time: "12:30" },
                  { label: "Secondo Turno", time: "13:30" },
                  { label: "Terzo Turno", time: "14:30" }
                ].map((fascia, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="text" defaultValue={fascia.label} className="w-1/3 px-3 py-2 border rounded-md" />
                    <input type="time" defaultValue={fascia.time} className="w-32 px-3 py-2 border rounded-md" />
                    <button type="button" className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button type="button" className="text-sm flex items-center gap-1 text-blue-600 mt-2 font-medium">
                  <Plus size={16} /> Aggiungi Fascia
                </button>
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
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commissione Carta</label>
                  <select className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="none">Nessuna maggiorazione</option>
                    <option value="fixed">Costo fisso (€)</option>
                    <option value="percent">Percentuale (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valore Commissione</label>
                  <input type="number" step="0.01" defaultValue="0.50" className="w-full px-3 py-2 border rounded-md" />
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
              <input type="text" defaultValue="Tiki Taka di Mario Rossi" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA / Codice Fiscale</label>
              <input type="text" defaultValue="IT12345678901" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Sede</label>
              <input type="text" defaultValue="Via del Ristorante 1, Roma" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contatto Telefonico (per urgenze)</label>
              <input type="tel" defaultValue="+39 333 1234567" className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Testo a piè di pagina (Ricevuta)</label>
              <textarea rows={3} defaultValue="Grazie per aver scelto Tiki Taka! Conserva questa ricevuta." className="w-full px-3 py-2 border rounded-md"></textarea>
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
