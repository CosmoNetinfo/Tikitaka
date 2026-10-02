"use client";

import { usePathname } from "next/navigation";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="w-full min-h-screen bg-gray-50 flex flex-col">{children}</div>;
  }

  return (
    <div className="max-w-lg mx-auto w-full bg-white min-h-screen flex flex-col shadow-sm relative">
      {children}
    </div>
  );
}
