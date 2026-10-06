'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';

import { createClient } from '@/lib/supabase/client';
import { calculateOrderTotal, formatCurrency, DEFAULT_COMBOS, ComboRow } from '@/lib/utils/pricing';

interface MenuData {
  primoFormatos: string[];
  primoCondimentos: string[];
  secondos: string[];
  contornos: string[];
  drinks: string[];
  fuoriMenu: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
}

export default function BuildMeal({ params }: { params: { date: string, slotId: string } }) {
  const router = useRouter();
  const order = useOrderStore();
  
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [combos, setCombos] = useState<ComboRow[]>(DEFAULT_COMBOS);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const supabase = createClient();
        const [{ data: menuItems }, { data: specialItems }, { data: combosData }] = await Promise.all([
          supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('special_items').select('*').eq('is_active', true).order('name'),
          supabase.from('combos').select('*').eq('is_active', true)
        ]);

        if (combosData && combosData.length > 0) {
          setCombos(combosData as ComboRow[]);
        }

        const primoFormatos = menuItems?.filter(i => i.category === 'primo_formato').map(i => i.name) || [];
        const primoCondimentos = menuItems?.filter(i => i.category === 'primo_condimento').map(i => i.name) || [];
        const secondos = menuItems?.filter(i => i.category === 'secondo').map(i => i.name) || [];
        const contornos = menuItems?.filter(i => i.category === 'contorno').map(i => i.name) || [];
        const drinks = menuItems?.filter(i => i.category === 'bibita').map(i => i.name) || [];

        const fuoriMenu = specialItems?.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price_cents,
          image: s.image_url || '⭐'
        })) || [];

        setMenu({
          primoFormatos: primoFormatos.length > 0 ? primoFormatos : ['Linguine', 'Penne'],
          primoCondimentos: primoCondimentos.length > 0 ? primoCondimentos : ['Pomodoro e basilico', 'Pesto genovese', 'Cacio e pepe'],
          secondos: secondos.length > 0 ? secondos : ['Coscetti di pollo', 'Polpette al pomodoro', 'Spezzatino in agrodolce'],
          contornos: contornos.length > 0 ? contornos : ['Insalata verde', 'Patate al forno'],
          drinks: drinks.length > 0 ? drinks : ['Coca-Cola', 'Fanta', 'Sprite'],
          fuoriMenu
        });
      } catch (err) {
        console.error("Error loading real menu:", err);
      }
    };

    fetchMenu();
  }, []);

  const pricingResult = useMemo(() => {
    const specialItemsList = menu?.fuoriMenu
      ? Object.entries(order.specialItems)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => {
            const item = menu.fuoriMenu.find(i => i.id === id);
            return { id, qty, price_cents: item?.price || 0 };
          })
      : [];

    return calculateOrderTotal({
      combo: {
        primo_formato: order.primo.formato,
        primo_condimento: order.primo.condimento,
        secondo: order.secondo,
        contorno: order.contorno,
        drink: order.drink
      },
      special_items: specialItemsList,
      combos
    });
  }, [order, menu, combos]);

  const isValid = pricingResult.valid;
  const totalPrice = pricingResult.total_cents;

  const comboName = useMemo(() => {
    if (pricingResult.combo) {
      return pricingResult.combo.label;
    }
    const hasSpecial = Object.values(order.specialItems).some(q => q > 0);
    if (hasSpecial) return 'Solo fuori menu';
    return 'Seleziona i piatti';
  }, [pricingResult, order.specialItems]);

  if (!menu) return <div className="p-8 text-center">Caricamento menu...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-36">
      <Header />
      
      <main className="flex-1 p-4">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 mt-2 px-2">Componi il pranzo</h1>

        {/* PRIMO */}
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4">1. PRIMO</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Formato pasta</label>
            <div className="grid grid-cols-2 gap-2">
              {menu.primoFormatos.map(f => (
                <button 
                  key={f}
                  onClick={() => order.setPrimoFormato(order.primo.formato === f ? null : f)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                    order.primo.formato === f 
                      ? 'bg-[#14213D] text-white border-[#14213D]' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Condimento</label>
            <div className="grid grid-cols-1 gap-2">
              {menu.primoCondimentos.map(c => (
                <button 
                  key={c}
                  disabled={!order.primo.formato}
                  onClick={() => order.setPrimoCondimento(order.primo.condimento === c ? null : c)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border-2 text-left transition-colors ${
                    !order.primo.formato 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' 
                      : order.primo.condimento === c 
                        ? 'bg-[#14213D] text-white border-[#14213D]' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECONDO */}
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4">2. SECONDO</h2>
          <div className="grid grid-cols-1 gap-2">
            {menu.secondos.map(s => (
              <button 
                key={s}
                onClick={() => {
                  if (order.secondo === s) {
                    order.setSecondo(null);
                    order.setContorno(null);
                  } else {
                    order.setSecondo(s);
                  }
                }}
                className={`py-3 px-4 rounded-xl text-sm font-medium border-2 text-left transition-colors ${
                  order.secondo === s 
                    ? 'bg-[#14213D] text-white border-[#14213D]' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* CONTORNO */}
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4">3. CONTORNO</h2>
          <p className="text-xs text-gray-500 mb-3">Disponibile solo con il secondo</p>
          <div className="grid grid-cols-2 gap-2">
            {menu.contornos.map(c => (
              <button 
                key={c}
                disabled={!order.secondo}
                onClick={() => order.setContorno(order.contorno === c ? null : c)}
                className={`py-3 px-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                  !order.secondo
                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                    : order.contorno === c 
                      ? 'bg-[#14213D] text-white border-[#14213D]' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* BIBITA */}
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-[#14213D] mb-4">4. BIBITA (Opzionale)</h2>
          <div className="grid grid-cols-1 gap-2">
            {menu.drinks.map(d => (
              <button 
                key={d}
                onClick={() => order.setDrink(order.drink === d ? null : d)}
                className={`py-3 px-4 rounded-xl text-sm font-medium border-2 text-left transition-colors flex justify-between items-center ${
                  order.drink === d 
                    ? 'bg-[#14213D] text-white border-[#14213D]' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{d}</span>
                <span className={`text-xs font-semibold ${order.drink === d ? 'text-[#FFC300]' : 'text-gray-500'}`}>+2,00 €</span>
              </button>
            ))}
          </div>
        </section>

        {/* FUORI MENU */}
        {menu.fuoriMenu.length > 0 && (
          <section className="bg-[#FFF9E6] border border-[#FFE066] rounded-2xl p-5 mb-4 shadow-sm">
            <h2 className="text-lg font-black text-[#14213D] mb-1">⭐ FUORI MENU</h2>
            <p className="text-sm text-gray-600 mb-4">Specialità del giorno</p>
            
            <div className="space-y-4">
              {menu.fuoriMenu.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center">
                    {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" />
                    ) : (
                      <span className="text-2xl mr-3">{item.image}</span>
                    )}
                    <div>
                      <div className="font-bold text-[#14213D]">{item.name}</div>
                      <div className="text-sm font-semibold text-[#FFC300]">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button 
                      onClick={() => order.setSpecialItem(item.id, Math.max(0, (order.specialItems[item.id] || 0) - 1))}
                      className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 active:bg-gray-200 rounded-l-lg"
                    >-</button>
                    <span className="w-6 text-center font-bold">{order.specialItems[item.id] || 0}</span>
                    <button 
                      onClick={() => order.setSpecialItem(item.id, Math.min(3, (order.specialItems[item.id] || 0) + 1))}
                      className="w-10 h-10 flex items-center justify-center font-bold text-[#14213D] active:bg-gray-200 rounded-r-lg"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="text-xs font-semibold text-gray-500 truncate">{comboName}</div>
            <div className="text-xl font-black text-[#14213D]">
              Totale: {formatCurrency(totalPrice)}
            </div>
          </div>
          
          <button
            disabled={!isValid}
            onClick={() => router.push(`/ordina/${params.date}/${params.slotId}/riepilogo`)}
            className={`py-3 px-8 rounded-xl font-bold text-lg min-w-[120px] transition-all ${
              isValid 
                ? 'bg-[#FFC300] text-[#14213D] hover:shadow-md active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            AVANTI
          </button>
        </div>
        {!isValid && (
          <div className="text-xs text-red-500 mt-2 font-medium text-center">
            {pricingResult.error || 'Seleziona almeno un piatto per continuare'}
          </div>
        )}
      </div>
    </div>
  );
}
