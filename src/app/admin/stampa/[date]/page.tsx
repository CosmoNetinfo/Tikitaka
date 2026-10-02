"use client";

import { useEffect } from "react";
import KitchenSummary from "@/components/admin/KitchenSummary";
import { useParams } from "next/navigation";

export default function StampaPage() {
  const params = useParams();
  const dateStr = typeof params.date === "string" ? params.date : new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);

  useEffect(() => {
    // Automatically open print dialog when component is mounted
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen text-black p-8 font-sans print:p-0">
      {/* Print-specific styles are handled via tailwind `print:` modifiers or a global css rule */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white; }
          @page { margin: 1cm; }
        }
      `}} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider">TIKI TAKA</h1>
            <p className="text-gray-600 font-medium text-lg mt-1">Riepilogo Ordini Cucina</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">
              {date.toLocaleDateString("it-IT", { 
                weekday: "long", 
                day: "numeric", 
                month: "long",
                year: "numeric"
              })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Stampato il {new Date().toLocaleString("it-IT")}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="print:shadow-none print:border-none">
          <KitchenSummary date={date} />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>Documento generato automaticamente da TIKI TAKA System</p>
        </div>
      </div>
    </div>
  );
}
