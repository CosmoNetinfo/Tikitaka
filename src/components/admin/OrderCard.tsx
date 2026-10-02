import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, CreditCard, Banknotes } from "lucide-react";

export type OrderStatus = "paid_card" | "cash_pending" | "cash_received" | "cancelled" | "unpaid";

interface OrderCardProps {
  order: {
    id: string;
    number: string;
    customerName: string;
    company: string;
    timeSlot: string;
    items: string[];
    totalCents: number;
    status: OrderStatus;
    notes?: string;
  };
  onStatusChange?: (id: string, newStatus: OrderStatus) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const formatPrice = (cents: number) => `€ ${(cents / 100).toFixed(2)}`;

  const statusConfig = {
    paid_card: { label: "💳 PAGATO", color: "bg-green-100 text-green-800 border-green-200" },
    cash_pending: { label: "💵 CONTANTI DA INCASSARE", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    cash_received: { label: "✅ CONTANTI RICEVUTI", color: "bg-blue-100 text-blue-800 border-blue-200" },
    cancelled: { label: "❌ ANNULLATO", color: "bg-gray-100 text-gray-600 border-gray-200" },
    unpaid: { label: "⚠️ NON PAGATO", color: "bg-red-100 text-red-800 border-red-200" },
  };

  const isCancelled = order.status === "cancelled";

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${isCancelled ? 'opacity-60 grayscale' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#14213D]">#{order.number}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${statusConfig[order.status].color}`}>
              {statusConfig[order.status].label}
            </span>
          </div>
          <p className="font-medium text-gray-900 mt-1">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.company}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{formatPrice(order.totalCents)}</p>
          <div className="flex items-center gap-1 justify-end text-sm text-gray-600 mt-1">
            <Clock size={14} />
            <span>{order.timeSlot}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {order.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {order.notes && (
          <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <p><strong>Note:</strong> {order.notes}</p>
          </div>
        )}
      </div>

      {onStatusChange && !isCancelled && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {order.status === "cash_pending" && (
            <button 
              onClick={() => onStatusChange(order.id, "cash_received")}
              className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Segna Contanti Ricevuti
            </button>
          )}
          {order.status !== "unpaid" && (
            <button 
              onClick={() => onStatusChange(order.id, "unpaid")}
              className="text-sm bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Segna Non Pagato
            </button>
          )}
          <button 
            onClick={() => onStatusChange(order.id, "cancelled")}
            className="text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md font-medium transition-colors ml-auto"
          >
            Annulla Ordine
          </button>
        </div>
      )}
    </div>
  );
}
