"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, UtensilsCrossed, Settings, ListOrdered, CalendarDays } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Ordini", href: "/admin/ordini", icon: ListOrdered },
  { name: "Fuori Menu", href: "/admin/fuori-menu", icon: CalendarDays },
  { name: "Menu e Prezzi", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Impostazioni", href: "/admin/impostazioni", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    // TODO: Implement Supabase sign out
    console.log("Logout");
  };

  return (
    <>
      <div className="md:hidden flex items-center justify-between bg-[#14213D] p-4 text-white">
        <span className="font-bold text-xl">TIKI TAKA Admin</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-[#14213D] text-white flex flex-col z-50`}
      >
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-[#FFC300]">TIKI TAKA</h1>
          <p className="text-sm text-gray-400">Pannello Amministratore</p>
        </div>

        <nav className="flex-1 px-4 mt-6 md:mt-0 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#FFC300] text-[#14213D] font-medium"
                    : "hover:bg-white/10"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg hover:bg-white/10 transition-colors text-red-400 hover:text-red-300"
          >
            <LogOut size={20} />
            <span>Esci</span>
          </button>
        </div>
      </div>
    </>
  );
}
