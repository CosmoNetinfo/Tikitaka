"use client";

import { useState } from "react";
import DaySelector from "@/components/admin/DaySelector";
import KitchenSummary from "@/components/admin/KitchenSummary";
import { Printer } from "lucide-react";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handlePrint = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    window.open(`/admin/stampa/${dateStr}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#14213D]">Dashboard</h1>
        <div className="flex items-center gap-4">
          <DaySelector selectedDate={selectedDate} onChange={setSelectedDate} />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#14213D] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Stampa Riepilogo</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
          <h3 className="text-sm text-gray-500 font-medium">Ordini Totali</h3>
          <p className="text-2xl font-bold mt-1">42</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 border-t-[#FFC300]">
          <h3 className="text-sm text-gray-500 font-medium">Per Fascia</h3>
          <p className="text-lg font-bold mt-1">15 <span className="text-sm text-gray-400 font-normal">T1</span> | 20 <span className="text-sm text-gray-400 font-normal">T2</span> | 7 <span className="text-sm text-gray-400 font-normal">T3</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 border-t-purple-500">
          <h3 className="text-sm text-gray-500 font-medium">Incasso Previsto</h3>
          <p className="text-2xl font-bold mt-1">385,50 €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 border-t-green-500">
          <h3 className="text-sm text-gray-500 font-medium">Già Pagato (Carta)</h3>
          <p className="text-2xl font-bold mt-1">210,00 €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 border-t-red-500">
          <h3 className="text-sm text-gray-500 font-medium">Da Riscuotere</h3>
          <p className="text-2xl font-bold mt-1">175,50 €</p>
        </div>
      </div>

      {/* Kitchen Summary */}
      <KitchenSummary date={selectedDate} />
    </div>
  );
}
