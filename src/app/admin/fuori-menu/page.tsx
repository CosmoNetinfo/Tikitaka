"use client";

import { useState } from "react";
import { Plus, Edit2, Copy, Power } from "lucide-react";
import SpecialItemForm from "@/components/admin/SpecialItemForm";

export default function FuoriMenuPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D]">Fuori Menu</h1>
          <p className="text-gray-500 text-sm">Gestisci i piatti speciali e le offerte temporanee.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#FFC300] text-[#14213D] px-4 py-2 rounded-lg font-medium hover:bg-[#e6b000] transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nuovo Articolo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Item Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-40 bg-gray-200 w-full relative">
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
              ATTIVO
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              [Foto]
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-[#14213D] leading-tight">Insalatona Pollo e Grana</h3>
              <span className="font-bold text-[#14213D] bg-yellow-100 px-2 py-1 rounded">€ 8,50</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">Mix di insalate, petto di pollo grigliato, scaglie di grana, pomodorini, olive. Include acqua.</p>
            
            <div className="pt-2 border-t flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Disponibile: <span className="font-medium text-gray-800">12 Ott - 15 Ott</span>
              </div>
              
              <div className="flex gap-2">
                <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Duplica">
                  <Copy size={16} />
                </button>
                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Modifica">
                  <Edit2 size={16} />
                </button>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Disattiva">
                  <Power size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Example Inactive Item Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-75 grayscale hover:grayscale-0 transition-all">
          <div className="h-40 bg-gray-200 w-full relative">
             <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
              NON ATTIVO
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-[#14213D] leading-tight">Zuppa di Legumi</h3>
              <span className="font-bold text-[#14213D] bg-gray-100 px-2 py-1 rounded">€ 7,00</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">Zuppa calda con ceci, fagioli e lenticchie. Ideale per l'inverno.</p>
            
            <div className="pt-2 border-t flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Scaduto il: <span className="font-medium text-gray-800">28 Feb</span>
              </div>
              
              <div className="flex gap-2">
                <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Duplica">
                  <Copy size={16} />
                </button>
                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Modifica">
                  <Edit2 size={16} />
                </button>
                <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Riattiva">
                  <Power size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && <SpecialItemForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
