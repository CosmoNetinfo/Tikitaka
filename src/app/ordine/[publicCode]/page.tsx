import Link from 'next/link';
import Header from '@/components/ui/Header';
import StatusBadge from '@/components/ui/StatusBadge';

export default function OrderConfirmation({ params }: { params: { publicCode: string } }) {
  // Mock data for the confirmation page
  const orderNumber = '#0048';
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-safe">
      <Header />
      
      <main className="flex-1 p-4 pb-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mt-8">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-black text-[#14213D] mb-2 text-center">
          Ordine confermato!
        </h1>
        <p className="text-gray-600 text-center mb-8 px-4">
          Grazie per il tuo ordine. Riceverai il pranzo direttamente in azienda.
        </p>

        <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#14213D] text-white p-4 flex justify-between items-center">
            <span className="font-bold text-lg">Ordine {orderNumber}</span>
            <span className="text-xs opacity-70 bg-white/20 px-2 py-1 rounded">{params.publicCode}</span>
          </div>
          
          <div className="p-5">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Consegna</p>
                  <p className="font-bold text-[#14213D]">Martedì 6 ottobre</p>
                  <p className="text-[#14213D]">Primo turno (12:00)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium mb-1">Luogo</p>
                  <p className="font-bold text-[#14213D]">Tecnokar</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Riepilogo piatti</h3>
              <ul className="space-y-2 text-[#14213D] font-medium">
                <li className="flex justify-between"><span>1x Menu Completo</span><span>9,00 €</span></li>
                <li className="text-sm text-gray-500 ml-4">- Penne al pomodoro</li>
                <li className="text-sm text-gray-500 ml-4">- Coscetti di pollo</li>
                <li className="text-sm text-gray-500 ml-4">- Patate al forno</li>
                <li className="flex justify-between mt-2"><span>1x Acqua Naturale</span><span>0,00 €</span></li>
              </ul>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-4">
              <span className="font-bold text-gray-600">Totale</span>
              <span className="text-2xl font-black text-[#14213D]">9,00 €</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Stato pagamento</span>
              <StatusBadge status="CONTANTI DA INCASSARE" />
            </div>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Link 
            href={`/ordine/${params.publicCode}/ricevuta`}
            className="w-full py-4 px-6 bg-white border-2 border-[#14213D] text-[#14213D] rounded-xl font-bold text-center block hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            VEDI RICEVUTA
          </Link>
          
          <Link 
            href="/"
            className="w-full py-4 px-6 bg-[#FFC300] text-[#14213D] rounded-xl font-bold text-center block hover:shadow-md active:scale-[0.98] transition-all"
          >
            FAI UN ALTRO ORDINE
          </Link>
        </div>
      </main>
    </div>
  );
}
