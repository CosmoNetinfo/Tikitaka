'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';
import { createClient } from '@/lib/supabase/client';
import { calculateOrderTotal, formatCurrency, DEFAULT_COMBOS, ComboRow } from '@/lib/utils/pricing';

export default function Payment({ params }: { params: { date: string, slotId: string } }) {
  const router = useRouter();
  const order = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [combos, setCombos] = useState<ComboRow[]>(DEFAULT_COMBOS);
  const [specialItemsList, setSpecialItemsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const [{ data: cData }, { data: sData }] = await Promise.all([
          supabase.from('combos').select('*').eq('is_active', true),
          supabase.from('special_items').select('*').eq('is_active', true)
        ]);
        if (cData && cData.length > 0) setCombos(cData as ComboRow[]);
        if (sData) setSpecialItemsList(sData);
      } catch (e) {
        console.error('Error loading combos:', e);
      }
    }
    loadData();
  }, []);

  const pricingResult = calculateOrderTotal({
    combo: {
      primo_formato: order.primo.formato,
      primo_condimento: order.primo.condimento,
      secondo: order.secondo,
      contorno: order.contorno,
      drink: order.drink
    },
    special_items: Object.entries(order.specialItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = specialItemsList.find(s => s.id === id);
        return { id, qty, price_cents: item?.price_cents || 700 };
      }),
    combos
  });

  const total = pricingResult.total_cents;

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let activeSlotId = params?.slotId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeSlotId);
      if (!isUuid) {
        const { data: slots } = await supabase.from('delivery_slots').select('*').eq('is_active', true).order('sort_order');
        if (slots && slots.length > 0) {
          const idx = parseInt(activeSlotId, 10) - 1;
          activeSlotId = slots[idx >= 0 && idx < slots.length ? idx : 0].id;
        }
      }

      let clientToken = localStorage.getItem('tikitaka_client_token');
      if (!clientToken) {
        clientToken = 'tok_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('tikitaka_client_token', clientToken);
      }

      const orderPayload = {
        company_slug: 'tecnokar',
        delivery_date: params.date,
        slot_id: activeSlotId,
        customer_first_name: order.customer.nome || 'Cliente',
        customer_last_name: order.customer.cognome || 'Tecnokar',
        notes: order.customer.note || '',
        client_token: clientToken,
        primo_formato: order.primo.formato || undefined,
        primo_condimento: order.primo.condimento || undefined,
        secondo: order.secondo || undefined,
        contorno: order.contorno || undefined,
        drink: order.drink || undefined,
        special_items: Object.entries(order.specialItems)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({ id, qty })),
        payment_method: 'cash'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const resData = await res.json();
      if (!res.ok) {
        alert('Errore ordine: ' + (resData.error || 'Impossibile completare l\'ordine'));
        setLoading(false);
        return;
      }

      const orderCode = resData.order?.public_code;
      
      // Save to local storage for "my orders" functionality
      const myOrdersStr = localStorage.getItem('tikitaka_my_orders') || '[]';
      const myOrders = JSON.parse(myOrdersStr);
      if (orderCode && !myOrders.includes(orderCode)) {
        myOrders.push(orderCode);
        localStorage.setItem('tikitaka_my_orders', JSON.stringify(myOrders));
      }

      // Clear store
      order.resetOrder();

      router.push(`/ordine/${orderCode}`);
    } catch (err: any) {
      console.error('Error creating cash order:', err);
      alert('Si è verificato un errore durante la creazione dell\'ordine.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-12 flex flex-col items-center">
        <div className="w-full self-start">
          <BackButton />
        </div>
        
        <h1 className="text-2xl font-bold text-[#14213D] mb-8 mt-2 text-center">Pagamento</h1>

        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 w-full text-center">
          <p className="text-gray-500 font-medium mb-2">Totale da pagare</p>
          <div className="text-5xl font-black text-[#14213D]">
            {formatCurrency(total)}
          </div>
        </div>

        <div className="w-full space-y-4">
          <button
            disabled={loading}
            onClick={handleCashPayment}
            className="w-full py-5 px-6 bg-[#14213D] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex justify-center items-center min-h-[70px] disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Elaborazione...
              </span>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                PAGA IN CONTANTI ALLA CONSEGNA
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6 px-4">
            Prepareremo il tuo ordine e potrai pagare in contanti quando ti verrà consegnato in azienda.
          </p>
        </div>
      </main>
    </div>
  );
}
