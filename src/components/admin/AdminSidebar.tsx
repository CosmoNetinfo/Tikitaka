"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, UtensilsCrossed, Settings, ListOrdered, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Ordini", href: "/admin/ordini", icon: ListOrdered },
  { name: "Fuori Menu", href: "/admin/fuori-menu", icon: CalendarDays },
  { name: "Sedi", href: "/admin/sedi", icon: MapPin },
  { name: "Calendario", href: "/admin/calendario", icon: CalendarDays },
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

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Status badge & publish button */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="font-semibold text-green-400">Modifiche Live per Clienti</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-2">
              Ogni modifica salvata è immediatamente visibile sull&apos;app cliente.
            </p>
            <button
              onClick={() => {
                alert("✓ Tutte le modifiche salvate nel pannello sono attive e visibili in tempo reale sull'app dei clienti!");
              }}
              className="w-full bg-[#FFC300] hover:bg-[#e6b000] text-[#14213D] font-bold py-1.5 px-2 rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>⚡ Rendi effettive modifiche</span>
            </button>
          </div>

          <a
            href="/ordina"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-medium transition-colors border border-blue-500/30"
          >
            <span>📱 Apri App Cliente (Test)</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full rounded-lg hover:bg-white/10 transition-colors text-red-400 hover:text-red-300 text-sm"
          >
            <LogOut size={18} />
            <span>Esci</span>
          </button>
        </div>
      </div>
    </>
  );
}
