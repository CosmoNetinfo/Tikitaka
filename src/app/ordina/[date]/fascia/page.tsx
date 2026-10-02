'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import { useOrderStore } from '@/store/orderStore';

import { formatDateItalian } from '@/lib/utils/format';

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
    { id: '6cd9df29-0428-4183-b7a2-7ac28dcde53f', name: 'Primo turno', time: '12:00' },
    { id: '35afeaef-4731-44f9-96f5-0ed5f6d1a288', name: 'Secondo turno', time: '12:30' },
    { id: '08f0d25d-8453-46ca-867b-e8b3b3cf4019', name: 'Terzo turno', time: '13:00' },
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

  const formattedDate = formatDateItalian(params.date);

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        
        <div className="mb-6 px-2 mt-2">
          <h1 className="text-2xl font-bold text-[#14213D] mb-1">
            Scegli la fascia oraria
          </h1>
          <p className="text-gray-600">{formattedDate}</p>
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
