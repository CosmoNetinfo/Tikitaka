'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';

export default function SelectTime() {
  const router = useRouter();
  const params = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      // Mock for now, depending on siteId
      setSlots([
        { id: 'slot-1', label: '12:00', is_active: true },
        { id: 'slot-2', label: '12:30', is_active: true },
        { id: 'slot-3', label: '13:00', is_active: true },
      ]);
      setLoading(false);
    };
    fetchSlots();
  }, [params.siteId]);

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 px-2 mt-2">
          Scegli l'orario
        </h1>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-2xl w-full"></div>
            ))
          ) : (
            slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => router.push(`/ordina/${params.siteId}/${slot.id}`)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all min-h-[80px] bg-white border-gray-100 hover:border-[#FFC300] shadow-sm active:scale-[0.98]"
              >
                <div className="text-xl font-bold text-[#14213D]">{slot.label}</div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFC300]">
                  <path d="M9 18L15 12L9 6" />
                </svg>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
