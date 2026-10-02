"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DaySelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export default function DaySelector({ selectedDate, onChange }: DaySelectorProps) {
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onChange(newDate);
  };

  const handleToday = () => {
    onChange(new Date());
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
      <button
        onClick={handlePrevDay}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        <ChevronLeft size={20} className="text-[#14213D]" />
      </button>
      
      <div className="flex items-center space-x-2 font-medium text-[#14213D] min-w-[140px] justify-center">
        <CalendarIcon size={18} className="text-[#FFC300]" />
        <span>
          {selectedDate.toLocaleDateString("it-IT", {
            weekday: "short",
            day: "numeric",
            month: "short"
          }).toUpperCase()}
        </span>
      </div>

      <button
        onClick={handleNextDay}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        <ChevronRight size={20} className="text-[#14213D]" />
      </button>

      <button
        onClick={handleToday}
        className="text-sm font-medium text-[#14213D] hover:text-[#FFC300] px-3 py-1 border-l"
      >
        Oggi
      </button>
    </div>
  );
}
