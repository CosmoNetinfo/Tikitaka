"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, UtensilsCrossed, Settings, ListOrdered, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Ordini", href: "/admin/ordini", icon: ListOrdered },
  { name: "Fuori Menu", href: "/admin/fuori-menu", icon: CalendarDays },
  { name: "Menu e Prezzi", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Impostazioni", href: "/admin/impostazioni", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-[#14213D] px-4 py-2 text-white">
        <Image src="/logo-white.png" alt="Tiki Taka" width={140} height={47} className="h-10 w-auto" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-[#14213D] text-white flex flex-col z-50`}
      >
        {/* Desktop logo */}
        <div className="p-5 hidden md:flex flex-col items-center border-b border-white/10">
          <Image src="/logo-white.png" alt="Tiki Taka" width={180} height={60} className="w-40 h-auto" />
          <p className="text-xs text-gray-400 mt-1">Pannello Amministratore</p>
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
