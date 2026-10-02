'use client';

export default function Receipt({ params }: { params: { publicCode: string } }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen p-8 text-black font-mono text-sm max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">TIKI TAKA</h1>
        <p>di Laura Simonelli</p>
        <p>Via Roma 123, 06049 Spoleto (PG)</p>
        <p>P.IVA 01234567890</p>
        <p>Tel: 333 1234567</p>
      </div>

      <div className="border-t border-b border-black py-4 mb-6">
        <div className="flex justify-between mb-1">
          <span>Data ordine:</span>
          <span>02/10/2026</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Data consegna:</span>
          <span>06/10/2026</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Ordine N.:</span>
          <span>#0048</span>
        </div>
        <div className="flex justify-between">
          <span>Cliente:</span>
          <span>Mario Rossi (Tecnokar)</span>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-2">Q.tà</th>
            <th className="text-left py-2">Descrizione</th>
            <th className="text-right py-2">Prezzo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 align-top">1</td>
            <td className="py-2">
              Menu Completo
              <div className="text-xs text-gray-600 mt-1">
                - Penne al pomodoro<br/>
                - Coscetti di pollo<br/>
                - Patate al forno
              </div>
            </td>
            <td className="text-right py-2 align-top">9,00 €</td>
          </tr>
        </tbody>
      </table>

      <div className="border-t border-black pt-4 mb-8">
        <div className="flex justify-between font-bold text-lg">
          <span>TOTALE COMPLESSIVO</span>
          <span>9,00 €</span>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Pagamento:</span>
          <span>Contanti alla consegna</span>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-12">
        <p>Questo documento non ha valore fiscale.</p>
        <p className="mt-2">ID: {params.publicCode}</p>
      </div>

      <div className="mt-12 text-center print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-[#14213D] text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
        >
          STAMPA RICEVUTA
        </button>
        <button 
          onClick={() => window.history.back()}
          className="block w-full text-[#14213D] mt-4 font-medium underline"
        >
          Torna all'ordine
        </button>
      </div>
    </div>
  );
}
