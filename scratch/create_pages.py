import os

# Create site selection page
site_page = """'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';
import Image from 'next/image';

export default function SelectSite() {
  const router = useRouter();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sites from Supabase or API
    const fetchSites = async () => {
      // Mock for now or fetch actual
      setSites([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Tecnokar 1', is_active: true },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Tecnokar 2', is_active: true },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Tecnokar 3', is_active: true },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Tecnokar 4', is_active: true },
      ]);
      setLoading(false);
    };
    fetchSites();
  }, []);

  const handleSelect = (site) => {
    localStorage.setItem('selectedSiteName', site.name);
    localStorage.setItem('selectedSiteId', site.id);
    router.push(`/ordina/${site.id}`);
  }

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 px-2 mt-2">
          Scegli la sede
        </h1>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-2xl w-full"></div>
            ))
          ) : (
            sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSelect(site)}
                disabled={!site.is_active}
                className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all min-h-[100px] bg-white border-gray-100 hover:border-[#FFC300] shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  {/* Assuming logo is available in public folder or we can use img */}
                  <img src="/tecnokar-logo.png" alt="Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
                  <div className="text-xl font-bold text-[#14213D]">
                    {site.name}
                  </div>
                </div>
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
"""

with open(r"Q:\Tikitaka\src\app\ordina\page.tsx", "w", encoding="utf-8") as f:
    f.write(site_page)

# Create time selection page
time_page = """'use client';
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
"""
os.makedirs(r"Q:\Tikitaka\src\app\ordina\[siteId]", exist_ok=True)
with open(r"Q:\Tikitaka\src\app\ordina\[siteId]\page.tsx", "w", encoding="utf-8") as f:
    f.write(time_page)

# Create day selection page
day_page = """'use client';
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
      // Dynamic days
      setDays([
        { date: '2026-10-06', dayName: 'Martedì', formattedDate: '6 ottobre 2026', isOpen: true },
        { date: '2026-10-07', dayName: 'Mercoledì', formattedDate: '7 ottobre 2026', isOpen: true },
        { date: '2026-10-08', dayName: 'Giovedì', formattedDate: '8 ottobre 2026', isOpen: false },
        { date: '2026-10-09', dayName: 'Venerdì', formattedDate: '9 ottobre 2026', isOpen: true },
      ]);
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
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    Chiusi
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
"""
os.makedirs(r"Q:\Tikitaka\src\app\ordina\[siteId]\[slotId]", exist_ok=True)
with open(r"Q:\Tikitaka\src\app\ordina\[siteId]\[slotId]\page.tsx", "w", encoding="utf-8") as f:
    f.write(day_page)

print("Created Next.js pages.")
