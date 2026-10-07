'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';

export default function SelectDay() {
  const router = useRouter();
  const params = useParams();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await fetch(`/api/availability?siteId=${params.siteId}`);
        const data = await res.json();
        if (data.availableDates) {
          setDays(data.availableDates.map((d: any) => ({
            date: d.date,
            dayName: d.formattedDate.split(' ')[0], // Extract day name
            formattedDate: d.formattedDate,
            isOpen: d.isOpen,
            reason: d.reason
          })));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchDays();
  }, [params.siteId, params.slotId]);

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 px-2 mt-2">
          Scegli il giorno
        </h1>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-2xl w-full"></div>
            ))
          ) : (
            days.map((day) => (
              <button
                key={day.date}
                onClick={() => day.isOpen && router.push(`/ordina/${params.siteId}/${params.slotId}/${day.date}/pranzo`)}
                disabled={!day.isOpen}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all min-h-[100px] ${
                  day.isOpen 
                    ? 'bg-white border-gray-100 hover:border-[#FFC300] shadow-sm active:scale-[0.98]' 
                    : 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-left">
                  <div className={`text-xl font-bold mb-1 ${day.isOpen ? 'text-[#14213D]' : 'text-gray-500'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-sm ${day.isOpen ? 'text-gray-600' : 'text-gray-400'}`}>
                    {day.formattedDate}
                  </div>
                </div>
                {!day.isOpen ? (
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full text-center max-w-[120px]">
                    {day.reason || 'Ordini chiusi'}
                  </span>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFC300]">
                    <path d="M9 18L15 12L9 6" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
