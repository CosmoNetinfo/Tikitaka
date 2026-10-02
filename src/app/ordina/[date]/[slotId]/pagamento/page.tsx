'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';

export default function Payment() {
  const router = useRouter();
  const order = useOrderStore();
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    let total = 0;
    const hasPrimo = order.primo.formato && order.primo.condimento;
    const hasSecondo = order.secondo;
    
    if (hasPrimo && hasSecondo) total += 900;
    else if (hasPrimo) total += 600;
    else if (hasSecondo) total += 700;

    if (order.drink && order.drink.includes('+2')) total += 200;
    if (order.drink && order.drink.includes('+1')) total += 100;

    const fmPrice = 700;
    for (const [id, qty] of Object.entries(order.specialItems)) {
      if (qty > 0) total += fmPrice * qty;
    }

    return total;
  };

  const total = calculateTotal();

  const handleCashPayment = async () => {
    setLoading(true);
    // Simulate API call to create order
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock order code
    const mockCode = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Save to local storage for "my orders" functionality
    const myOrdersStr = localStorage.getItem('tikitaka_my_orders') || '[]';
    const myOrders = JSON.parse(myOrdersStr);
    myOrders.push(mockCode);
    localStorage.setItem('tikitaka_my_orders', JSON.stringify(myOrders));

    // Clear store
    order.resetOrder();

    router.push(`/ordine/${mockCode}`);
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
            {(total / 100).toFixed(2)} €
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
