import React from "react";

export default function KitchenSummary({ date }: { date: Date }) {
  // This is a placeholder for the actual kitchen summary logic
  // which will fetch data aggregated by time slot and dish category.
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-[#14213D] mb-4">Riepilogo Cucina</h2>
      <p className="text-gray-500 mb-6">
        Riepilogo per {date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder slots */}
        {["12:30", "13:30", "14:30"].map((slot, idx) => (
          <div key={slot} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-lg mb-3 flex justify-between border-b pb-2">
              <span>Turno {idx + 1}</span>
              <span className="text-[#FFC300] bg-[#14213D] px-2 py-0.5 rounded text-sm">{slot}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Primi</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>Linguine Pomodoro</span> <span className="font-bold">x3</span></li>
                  <li className="flex justify-between"><span>Penne Cacio e Pepe</span> <span className="font-bold">x2</span></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Secondi</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>Coscetti di pollo</span> <span className="font-bold">x5</span></li>
                </ul>
              </div>

               <div>
                <h4 className="font-semibold text-gray-700 mb-1">Contorni</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex justify-between"><span>Patate al forno</span> <span className="font-bold">x3</span></li>
                </ul>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <p className="font-bold text-sm text-right text-gray-600">Totale Ordini: 5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
