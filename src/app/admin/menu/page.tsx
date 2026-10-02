"use client";

import { useState } from "react";
import { Edit2, Plus, GripVertical } from "lucide-react";

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("formati");

  const tabs = [
    { id: "formati", label: "Formati Pasta" },
    { id: "condimenti", label: "Condimenti" },
    { id: "secondi", label: "Secondi" },
    { id: "contorni", label: "Contorni" },
    { id: "bibite", label: "Bibite" },
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

      {/* Tabs */}
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

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab !== "prezzi" ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#14213D]">
                Elenco {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button className="flex items-center gap-2 bg-[#14213D] text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-800 transition-colors">
                <Plus size={16} />
                Aggiungi
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Example List Items */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <GripVertical className="text-gray-400 cursor-move" size={20} />
                    <div className="w-12 h-12 bg-gray-200 rounded object-cover flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-[#14213D]">Elemento di esempio {i}</h4>
                      <p className="text-xs text-gray-500">Allergeni: Glutine, Lattosio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 size={18} />
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
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Menu Completo</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Primo + Secondo + Contorno + Acqua</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      <input type="number" defaultValue="12.00" step="0.50" className="w-20 px-2 py-1 border rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">Salva</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Menu Primo</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Primo + Acqua</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                       <input type="number" defaultValue="7.00" step="0.50" className="w-20 px-2 py-1 border rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">Salva</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
