import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Tiki Taka"
            width={340}
            height={113}
            priority
            className="w-72 h-auto mx-auto"
          />
        </div>

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
      
      <div className="mt-auto pt-6 pb-4 w-full border-t border-gray-100 flex flex-col items-center gap-3">
        <Link 
          href="/i-miei-ordini" 
          className="text-[#14213D] font-semibold underline decoration-2 underline-offset-4 hover:text-blue-800"
        >
          I miei ordini
        </Link>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <p>
            Sviluppata da{' '}
            <a 
              href="https://cosmonet.info" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-[#14213D] underline hover:text-[#FFC300] transition-colors"
            >
              Daniele Spalletti di cosmonet.info
            </a>
          </p>
          <span>•</span>
          <Link 
            href="/admin/login"
            className="text-gray-400 hover:text-[#14213D] transition-colors"
          >
            Area Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
