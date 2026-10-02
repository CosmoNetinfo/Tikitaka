'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateItalian } from '@/lib/utils/format';

export default function OrderConfirmation({ params }: { params: { publicCode: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${params.publicCode}/detail`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) setOrder(data.order);
        }
      } catch (e) {
        console.error('Error loading order detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params.publicCode]);

  const orderNumber = order ? `#${String(order.order_number).padStart(4, '0')}` : '#0048';
  const deliveryDateFormatted = order ? formatDateItalian(order.delivery_date) : 'Martedì 6 ottobre';
  const slotLabel = order?.slot?.label || 'Primo turno (12:00)';
  const companyName = order?.company?.name || 'Tecnokar';
  const totalCents = order?.total_cents ?? 1500;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mt-8">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-[#14213D] mb-2 text-center">
          Ordine confermato!
        </h1>
        <p className="text-gray-600 text-center mb-8 px-4">
          Grazie per il tuo ordine. Riceverai il pranzo direttamente in azienda.
        </p>

        <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#14213D] text-white p-4 flex justify-between items-center">
            <span className="font-bold text-lg">Ordine {orderNumber}</span>
            <span className="text-xs opacity-70 bg-white/20 px-2 py-1 rounded">{params.publicCode}</span>
          </div>
          
          <div className="p-5">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Consegna</p>
                  <p className="font-bold text-[#14213D]">{deliveryDateFormatted}</p>
                  <p className="text-[#14213D]">{slotLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium mb-1">Luogo</p>
                  <p className="font-bold text-[#14213D]">{companyName}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Riepilogo piatti</h3>
              <ul className="space-y-2 text-[#14213D] font-medium">
                {order ? (
                  <>
                    {(order.primo_formato || order.secondo) && (
                      <li className="flex justify-between">
                        <span>1x Menu</span>
                        <span>{formatCurrency(order.subtotal_cents - (order.drink ? 200 : 0) - (order.order_lines?.reduce((a: number, l: any) => a + l.unit_price_cents * l.qty, 0) || 0))}</span>
                      </li>
                    )}
                    {order.primo_formato && order.primo_condimento && (
                      <li className="text-sm text-gray-500 ml-4">- {order.primo_formato} - {order.primo_condimento}</li>
                    )}
                    {order.secondo && (
                      <li className="text-sm text-gray-500 ml-4">- {order.secondo}</li>
                    )}
                    {order.contorno && (
                      <li className="text-sm text-gray-500 ml-4">- {order.contorno}</li>
                    )}
                    <li><span className="flex justify-between mt-2"><span>1x Acqua Naturale</span><span>0,00 €</span></span></li>
                    {order.drink && (
                      <li className="flex justify-between mt-1"><span>1x {order.drink}</span><span>2,00 €</span></li>
                    )}
                    {order.order_lines?.map((line: any) => (
                      <li key={line.id} className="flex justify-between mt-1">
                        <span>{line.qty}x {line.name_snapshot}</span>
                        <span>{formatCurrency(line.unit_price_cents * line.qty)}</span>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    <li className="flex justify-between"><span>1x Menu Completo</span><span>13,00 €</span></li>
                    <li className="text-sm text-gray-500 ml-4">- Linguine - Pomodoro e basilico</li>
                    <li className="text-sm text-gray-500 ml-4">- Coscetti di pollo</li>
                    <li className="text-sm text-gray-500 ml-4">- Patate al forno</li>
                    <li className="flex justify-between mt-2"><span>1x Acqua Naturale</span><span>0,00 €</span></li>
                    <li className="flex justify-between mt-1"><span>1x Coca-Cola</span><span>2,00 €</span></li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-4">
              <span className="font-bold text-gray-600">Totale</span>
              <span className="text-2xl font-black text-[#14213D]">{formatCurrency(totalCents)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Stato pagamento</span>
              <StatusBadge status={order?.payment_status === 'paid' ? 'PAGATO CON CARTA' : 'CONTANTI DA INCASSARE'} />
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Link 
            href={`/ordine/${params.publicCode}/ricevuta`}
            className="w-full py-4 px-6 bg-white border-2 border-[#14213D] text-[#14213D] rounded-xl font-bold text-center block hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            VEDI RICEVUTA
          </Link>
          
          <Link 
            href="/"
            className="w-full py-4 px-6 bg-[#FFC300] text-[#14213D] rounded-xl font-bold text-center block hover:shadow-md active:scale-[0.98] transition-all"
          >
            FAI UN ALTRO ORDINE
          </Link>
        </div>
      </main>
    </div>
  );
}
