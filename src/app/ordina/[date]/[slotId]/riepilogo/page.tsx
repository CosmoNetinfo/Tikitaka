'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';
import { createClient } from '@/lib/supabase/client';
import { calculateOrderTotal, formatCurrency, DEFAULT_COMBOS, ComboRow } from '@/lib/utils/pricing';

export default function Summary({ params }: { params: { date: string, slotId: string } }) {
  const router = useRouter();
  const order = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [combos, setCombos] = useState<ComboRow[]>(DEFAULT_COMBOS);
  const [specialItemsList, setSpecialItemsList] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Load saved info
    const savedName = localStorage.getItem('tikitaka_nome');
    const savedSurname = localStorage.getItem('tikitaka_cognome');
    if (savedName || savedSurname) {
      order.setCustomerInfo({
        nome: savedName || '',
        cognome: savedSurname || ''
      });
    }

    async function loadPricingData() {
      try {
        const supabase = createClient();
        const [{ data: cData }, { data: sData }] = await Promise.all([
          supabase.from('combos').select('*').eq('is_active', true),
          supabase.from('special_items').select('*').eq('is_active', true)
        ]);
        if (cData && cData.length > 0) setCombos(cData as ComboRow[]);
        if (sData) setSpecialItemsList(sData);
      } catch (e) {
        console.error('Error loading pricing data:', e);
      }
    }
    loadPricingData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    order.setCustomerInfo({ [e.target.name]: e.target.value });
  };

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

  const handleProceed = () => {
    localStorage.setItem('tikitaka_nome', order.customer.nome);
    localStorage.setItem('tikitaka_cognome', order.customer.cognome);
    router.push(`/ordina/${params.date}/${params.slotId}/pagamento`);
  };

  const total = pricingResult.total_cents;
  const isFormValid = order.customer.nome.trim() && order.customer.cognome.trim() && pricingResult.valid;

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-12">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 mt-2 px-2">Riepilogo ordine</h1>

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4 border-b pb-2">Il tuo pranzo</h2>
          
          <ul className="space-y-3 mb-4 text-gray-700">
            {pricingResult.combo && (
              <li className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Combinazione: {pricingResult.combo.label}
              </li>
            )}
            {order.primo.formato && order.primo.condimento && (
              <li><span className="font-semibold text-[#14213D]">Primo:</span> {order.primo.formato} - {order.primo.condimento}</li>
            )}
            {order.secondo && (
              <li><span className="font-semibold text-[#14213D]">Secondo:</span> {order.secondo}</li>
            )}
            {order.contorno && (
              <li><span className="font-semibold text-[#14213D]">Contorno:</span> {order.contorno}</li>
            )}
            <li><span className="font-semibold text-[#14213D]">Acqua:</span> Inclusa</li>
            {order.drink && (
              <li><span className="font-semibold text-[#14213D]">Bibita extra:</span> {order.drink} (+2,00 €)</li>
            )}
            {Object.entries(order.specialItems).filter(([_, q]) => q > 0).map(([id, qty]) => {
              const item = specialItemsList.find(s => s.id === id);
              return (
                <li key={id}><span className="font-semibold text-[#14213D]">Fuori menu:</span> {qty}x {item?.name || 'Piatto speciale'} ({formatCurrency((item?.price_cents || 700) * qty)})</li>
              );
            })}
          </ul>
          
          <div className="flex justify-between items-center border-t pt-4 mt-2">
            <span className="font-bold text-gray-600">Totale</span>
            <span className="text-xl font-black text-[#14213D]">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4">I tuoi dati</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
              <input 
                type="text" 
                name="nome"
                value={order.customer.nome}
                onChange={handleChange}
                placeholder="Il tuo nome"
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cognome *</label>
              <input 
                type="text" 
                name="cognome"
                value={order.customer.cognome}
                onChange={handleChange}
                placeholder="Il tuo cognome"
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Azienda</label>
              <select 
                name="azienda"
                value={order.customer.azienda}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none"
              >
                <option value="Tecnokar">Tecnokar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Note per la cucina (Opzionale)</label>
              <textarea 
                name="note"
                value={order.customer.note}
                onChange={handleChange}
                placeholder="Es. senza sale, intolleranze..."
                maxLength={200}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#FFC300] focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <button
          disabled={!isFormValid}
          onClick={handleProceed}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg min-h-[60px] ${
            isFormValid 
              ? 'bg-[#FFC300] text-[#14213D] hover:shadow-xl active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          PROCEDI AL PAGAMENTO
        </button>
      </main>
    </div>
  );
}
