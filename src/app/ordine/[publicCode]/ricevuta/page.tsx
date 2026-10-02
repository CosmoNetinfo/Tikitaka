'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils/format';

export default function Receipt({ params }: { params: { publicCode: string } }) {
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${params.publicCode}/detail`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) setOrder(data.order);
        }
      } catch (e) {
        console.error('Error loading receipt data:', e);
      }
    }
    loadOrder();
  }, [params.publicCode]);

  const handlePrint = () => {
    window.print();
  };

  const orderNumber = order ? `#${String(order.order_number).padStart(4, '0')}` : '#0048';
  const customerName = order ? `${order.customer_first_name} ${order.customer_last_name}` : 'Mario Rossi';
  const companyName = order?.company?.name || 'Tecnokar';
  const totalCents = order?.total_cents ?? 1500;
  const orderDate = order?.created_at ? new Date(order.created_at).toLocaleDateString('it-IT') : '02/10/2026';
  const deliveryDate = order?.delivery_date ? new Date(order.delivery_date).toLocaleDateString('it-IT') : '06/10/2026';

  const comboPrice = order ? (order.subtotal_cents - (order.drink ? 200 : 0) - (order.order_lines?.reduce((a: number, l: any) => a + l.unit_price_cents * l.qty, 0) || 0)) : 1300;

  return (
    <div className="bg-white min-h-screen p-8 text-black font-mono text-sm max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">TIKI TAKA</h1>
        <p>di Laura Simonelli</p>
        <p>Via dei Vetrai 58, 06049 Spoleto (PG)</p>
        <p>P.IVA 04034150542</p>
        <p>Tel: 329 323 9693</p>
      </div>

      <div className="border-t border-b border-black py-4 mb-6">
        <div className="flex justify-between mb-1">
          <span>Data ordine:</span>
          <span>{orderDate}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Data consegna:</span>
          <span>{deliveryDate}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Ordine N.:</span>
          <span>{orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Cliente:</span>
          <span>{customerName} ({companyName})</span>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2">Q.tà</th>
            <th className="text-left py-2">Descrizione</th>
            <th className="text-right py-2">Prezzo</th>
          </tr>
        </thead>
        <tbody>
          {order ? (
            <>
              {(order.primo_formato || order.secondo) && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 align-top">1</td>
                  <td className="py-2">
                    Menu Pranzo
                    <div className="text-xs text-gray-600 mt-1">
                      {order.primo_formato && <div>- {order.primo_formato} {order.primo_condimento}</div>}
                      {order.secondo && <div>- {order.secondo}</div>}
                      {order.contorno && <div>- {order.contorno}</div>}
                      <div>- Acqua Naturale</div>
                    </div>
                  </td>
                  <td className="text-right py-2 align-top">{formatCurrency(comboPrice)}</td>
                </tr>
              )}
              {order.drink && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 align-top">1</td>
                  <td className="py-2">{order.drink}</td>
                  <td className="text-right py-2 align-top">2,00 €</td>
                </tr>
              )}
              {order.order_lines?.map((ol: any) => (
                <tr key={ol.id} className="border-b border-gray-200">
                  <td className="py-2 align-top">{ol.qty}</td>
                  <td className="py-2">{ol.name_snapshot}</td>
                  <td className="text-right py-2 align-top">{formatCurrency(ol.unit_price_cents * ol.qty)}</td>
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td className="py-2 align-top">1</td>
              <td className="py-2">
                Menu Completo
                <div className="text-xs text-gray-600 mt-1">
                  - Linguine Pomodoro e basilico<br/>
                  - Coscetti di pollo<br/>
                  - Patate al forno<br/>
                  - Acqua Naturale<br/>
                  - Coca-Cola (2,00 €)
                </div>
              </td>
              <td className="text-right py-2 align-top">15,00 €</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-black pt-4 mb-8">
        <div className="flex justify-between font-bold text-lg">
          <span>TOTALE COMPLESSIVO</span>
          <span>{formatCurrency(totalCents)}</span>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Pagamento:</span>
          <span>{order?.payment_method === 'card' ? 'Carta di credito' : 'Contanti alla consegna'}</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-12">
        <p>Questo documento non ha valore fiscale.</p>
        <p className="mt-2">ID: {params.publicCode}</p>
      </div>

      <div className="mt-12 text-center print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-[#14213D] text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
        >
          STAMPA RICEVUTA
        </button>
        <button 
          onClick={() => window.history.back()}
          className="block w-full text-[#14213D] mt-4 font-medium underline"
        >
          Torna all'ordine
        </button>
      </div>
    </div>
  );
}
