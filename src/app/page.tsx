import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <h1 className="text-5xl font-black tracking-tighter text-[#14213D] mb-8">
          TIKI TAKA
        </h1>
        
        <p className="text-xl font-medium text-gray-800 mb-12 max-w-xs mx-auto">
          Benvenuto! Ordina il tuo pranzo e ricevilo direttamente in azienda.
        </p>

        <Link 
          href="/ordina" 
          className="w-full max-w-sm bg-[#FFC300] text-[#14213D] font-bold text-lg py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 mb-8 flex justify-center items-center min-h-[60px]"
        >
          ORDINA IL PRANZO
        </Link>
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 w-full max-w-sm">
          <p className="text-sm text-[#14213D] font-medium">
            ⏱️ Gli ordini si chiudono alle ore 14:00 del giorno prima della consegna.
          </p>
        </div>
      </div>
      
      <div className="mt-auto pt-8 pb-4 w-full border-t border-gray-100">
        <Link 
          href="/i-miei-ordini" 
          className="text-[#14213D] font-semibold underline decoration-2 underline-offset-4 hover:text-blue-800 p-4 inline-block"
        >
          I miei ordini
        </Link>
      </div>
    </main>
  );
}
