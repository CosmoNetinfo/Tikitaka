"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
