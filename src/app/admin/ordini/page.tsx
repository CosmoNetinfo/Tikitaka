"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DaySelector from "@/components/admin/DaySelector";
import OrderCard, { OrderStatus } from "@/components/admin/OrderCard";
import { formatCurrency } from "@/lib/utils/format";


export default function OrdiniPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slotFilter, setSlotFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Create local date string safely
      const dateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const { data } = await supabase.from('orders')
        .select('*, slot:delivery_slots(*), combo:combos(*), order_lines(*)')
        .eq('delivery_date', dateStr);
      
      if (data) {
        const mapped = data.map((o: any) => {
          let items: string[] = [];
          if (o.combo) {
             items.push(`${o.combo.label}: ${[o.primo_formato, o.primo_condimento, o.secondo, o.contorno, o.drink].filter(Boolean).join(', ')}`);
          }
          if (o.order_lines) {
             o.order_lines.forEach((ol: any) => items.push(`${ol.qty}x ${ol.name_snapshot}`));
          }
          return {
            id: o.id,
            number: o.order_number.toString().padStart(4, '0'),
            customerName: o.customer_first_name + ' ' + o.customer_last_name,
            company: 'Azienda',
            timeSlot: o.slot?.delivery_time || '',
            items,
            totalCents: o.total_cents,
            status: o.status === 'cancelled' ? 'cancelled' : 
                    o.payment_status === 'paid' ? 'paid_card' : 
                    o.payment_status === 'cash_pending' ? 'cash_pending' :
                    o.payment_status === 'cash_received' ? 'cash_received' : 'unpaid',
            notes: o.notes
          };
        });
        setOrders(mapped);
      }
    }
    load();
  }, [selectedDate]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    let update: any = {};
    if (newStatus === 'cancelled') update = { status: 'cancelled' };
    else if (newStatus === 'cash_received') update = { payment_status: 'cash_received' };
    else if (newStatus === 'unpaid') update = { payment_status: 'unpaid' };
    
    await supabase.from('orders').update(update).eq('id', id);
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
          <span className="font-bold text-xl ml-2 text-green-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      
      {/* Padding to account for fixed footer */}
      <div className="h-16"></div>
    </div>
  );
}
