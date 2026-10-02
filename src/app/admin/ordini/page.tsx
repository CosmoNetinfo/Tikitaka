"use client";

import { useState } from "react";
import DaySelector from "@/components/admin/DaySelector";
import OrderCard, { OrderStatus } from "@/components/admin/OrderCard";

// Mock data
const mockOrders = [
  {
    id: "1",
    number: "0048",
    customerName: "Mario Rossi",
    company: "Acme Corp",
    timeSlot: "13:30",
    items: ["Menu Completo: Linguine Pomodoro, Coscetti di pollo, Patate al forno, Acqua"],
    totalCents: 1200,
    status: "paid_card" as OrderStatus,
  },
  {
    id: "2",
    number: "0049",
    customerName: "Giulia Bianchi",
    company: "Tech Solutions",
    timeSlot: "12:30",
    items: ["Fuori Menu: Insalatona Tonno", "Coca-Cola"],
    totalCents: 850,
    status: "cash_pending" as OrderStatus,
    notes: "Senza cipolla",
  },
  {
    id: "3",
    number: "0050",
    customerName: "Luca Verdi",
    company: "Studio Legale",
    timeSlot: "14:30",
    items: ["Menu Primo: Penne Cacio e pepe, Acqua"],
    totalCents: 700,
    status: "cancelled" as OrderStatus,
  },
];

export default function OrdiniPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slotFilter, setSlotFilter] = useState("all");
  const [orders, setOrders] = useState(mockOrders);

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const activeOrders = orders.filter(o => o.status !== "cancelled");
  const cancelledOrders = orders.filter(o => o.status === "cancelled");

  const totalAmount = activeOrders.reduce((acc, o) => acc + o.totalCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#14213D]">Gestione Ordini</h1>
        <DaySelector selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-2">
        {["all", "12:30", "13:30", "14:30"].map((slot) => (
          <button
            key={slot}
            onClick={() => setSlotFilter(slot)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              slotFilter === slot
                ? "bg-[#14213D] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {slot === "all" ? "Tutti i turni" : `Turno ${slot}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeOrders
          .filter(o => slotFilter === "all" || o.timeSlot === slotFilter)
          .map(order => (
          <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {cancelledOrders.length > 0 && (
        <div className="pt-6">
          <h2 className="text-lg font-semibold text-gray-500 mb-4 border-b pb-2">Ordini Annullati</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cancelledOrders
              .filter(o => slotFilter === "all" || o.timeSlot === slotFilter)
              .map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t p-4 shadow-lg flex justify-between items-center z-10">
        <div>
          <span className="text-gray-500">Totale Ordini Attivi:</span>
          <span className="font-bold text-lg ml-2">{activeOrders.length}</span>
        </div>
        <div>
          <span className="text-gray-500">Incasso Totale:</span>
          <span className="font-bold text-xl ml-2 text-green-600">€ {(totalAmount / 100).toFixed(2)}</span>
        </div>
      </div>
      
      {/* Padding to account for fixed footer */}
      <div className="h-16"></div>
    </div>
  );
}
