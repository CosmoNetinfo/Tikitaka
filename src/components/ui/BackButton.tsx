'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Indietro' }: { label?: string }) {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()}
      className="flex items-center text-[#14213D] font-medium py-4 px-2 hover:opacity-70 transition-opacity"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  );
}
