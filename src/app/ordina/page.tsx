'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import BackButton from '@/components/ui/BackButton';

export default function SelectSite() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/sites')
      .then(r => r.json())
      .then(d => {
        if (d.sites) setSites(d.sites);
        else setError('Impossibile caricare le sedi.');
      })
      .catch(() => setError('Errore di rete.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (site: any) => {
    localStorage.setItem('tikitaka_selected_site_name', site.name);
    localStorage.setItem('tikitaka_selected_site_id', site.id);
    router.push(`/ordina/${site.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen pb-safe">
      <Header />
      <main className="flex-1 p-4 pb-24">
        <BackButton />
        <h1 className="text-2xl font-bold text-[#14213D] mb-6 px-2 mt-2">Scegli la sede</h1>
        <div className="space-y-4">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-2xl w-full" />
          ))}
          {error && <p className="text-red-500 px-2">{error}</p>}
          {!loading && sites.map(site => (
            <button
              key={site.id}
              onClick={() => handleSelect(site)}
              className="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all min-h-[100px] bg-white border-gray-100 hover:border-[#FFC300] shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <img
                  src="/tecnokar-logo.png"
                  alt="Logo"
                  className="h-10 w-auto object-contain mix-blend-multiply"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-3xl font-black text-[#14213D]">
                  {site.name.replace(/[^\d]/g, '') || site.name}
                </div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFC300]">
                <path d="M9 18L15 12L9 6" />
              </svg>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
