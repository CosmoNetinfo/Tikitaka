'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';

interface Slot {
  id: string;
  name: string;
  time: string;
}

export default function SelectSlot({ params }: { params: { date: string } }) {
  const router = useRouter();
  const setDate = useOrderStore(state => state.setDate);
  const setSlotId = useOrderStore(state => state.setSlotId);
  const [loading, setLoading] = useState(true);

  const slots: Slot[] = [
    { id: '1', name: 'Primo turno', time: '12:00' },
    { id: '2', name: 'Secondo turno', time: '12:30' },
    { id: '3', name: 'Terzo turno', time: '13:00' },
  ];

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectSlot = (slotId: string) => {
    setDate(params.date);
    setSlotId(slotId);
    router.push(`/ordina/${params.date}/${slotId}/pranzo`);
  };

  const formattedDate = new Date(params.date).toLocaleDateString('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        
        <div className="mb-6 px-2 mt-2">
          <h1 className="text-2xl font-bold text-[#14213D] mb-1">
            Scegli la fascia oraria
          </h1>
          <p className="text-gray-600 capitalize">{formattedDate}</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-28 rounded-2xl w-full"></div>
            ))
          ) : (
            slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSelectSlot(slot.id)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#FFC300] shadow-sm active:scale-[0.98] transition-all min-h-[110px]"
              >
                <div className="text-left">
                  <div className="text-[#14213D] font-bold text-lg mb-1">
                    {slot.name}
                  </div>
                  <div className="text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    consegna ore {slot.time}
                  </div>
                </div>
                
                <div className="bg-[#FFC300] bg-opacity-20 p-3 rounded-full text-[#14213D]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
