'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/utils/format';

interface Order {
  id: string;
  code: string;
  date: string;
  slot: string;
  total: number;
  status: 'PAGATO' | 'CONTANTI DA INCASSARE' | 'CONTANTI RICEVUTI' | 'ANNULLATO';
  itemsSummary: string;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = () => {
      const myOrdersStr = localStorage.getItem('tikitaka_my_orders');
      
      setTimeout(() => {
        if (myOrdersStr) {
          const codes = JSON.parse(myOrdersStr);
          // Mock hydrating orders
          setOrders(codes.map((code: string, i: number) => ({
            id: code,
            code: `#00${48 + i}`,
            date: 'Martedì 6 ottobre',
            slot: 'Primo turno (12:00)',
            total: 900,
            status: i === 0 ? 'CONTANTI DA INCASSARE' : 'PAGATO',
            itemsSummary: '1x Menu Completo'
          })));
        }
        setLoading(false);
      }, 500);
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-12">
        <BackButton label="Torna alla home" />
        
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 mt-2 px-2">I miei ordini</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white h-32 rounded-2xl w-full border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-4">🍽️</div>
            <h2 className="text-lg font-bold text-[#14213D] mb-2">Nessun ordine trovato</h2>
            <p className="text-gray-500 mb-6">Non hai ancora effettuato ordini da questo dispositivo.</p>
            <Link 
              href="/ordina"
              className="inline-block bg-[#FFC300] text-[#14213D] font-bold py-3 px-6 rounded-xl hover:shadow-md transition-all"
            >
              INIZIA A ORDINARE
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link 
                href={`/ordine/${order.id}`} 
                key={order.id}
                className="block bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#FFC300] transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-[#14213D] text-lg">{order.code}</div>
                    <div className="text-sm text-gray-500 font-medium">{order.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#14213D]">{formatCurrency(order.total)}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-[#14213D]">{order.itemsSummary}</div>
                  <div className="text-xs text-gray-500 mt-1">{order.slot}</div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <StatusBadge status={order.status} />
                  <span className="text-[#14213D] text-sm font-semibold flex items-center">
                    Dettagli
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
