import React from "react";
import { X } from "lucide-react";

interface SpecialItemFormProps {
  onClose: () => void;
  item?: any; // Will be properly typed
}

export default function SpecialItemForm({ onClose, item }: SpecialItemFormProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-[#14213D]">
            {item ? "Modifica Articolo" : "Nuovo Fuori Menu"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Articolo *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]"
                  placeholder="es. Insalatona Tonno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]"
                  rows={3}
                  placeholder="Ingredienti o dettagli..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo (€) *</label>
                <input
                  type="number"
                  step="0.10"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300]"
                  placeholder="8.50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opzionale)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center items-center h-32 bg-gray-50">
                  <span className="text-gray-500 text-sm">Carica immagine...</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Disponibilità *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md focus:ring-[#FFC300] focus:border-[#FFC300] mb-2"
                />
                <p className="text-xs text-gray-500">Seleziona le date in cui questo piatto sarà ordinabile.</p>
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="includesWater" className="rounded text-[#14213D] focus:ring-[#FFC300]" />
                <label htmlFor="includesWater" className="text-sm text-gray-700">
                  Include 1/2 litro d'acqua (come i menu)
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFC300] text-[#14213D] rounded-md font-medium hover:bg-[#e6b000]"
            >
              Salva Articolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
