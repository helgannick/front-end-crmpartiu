"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

      <header className="fixed top-0 left-0 w-full z-50 
        bg-white/10 backdrop-blur-xl border-b border-white/20
        flex items-center justify-between px-6 py-4">

    
        <div className="flex items-center gap-3">
          <Image
            src="/Logo-Partiu-Pra-Boa-foguete.svg" 
            alt="Logo"
            width={35}
            height={35}
            className="rounded-full"
          />
          <h1 className="text-xl font-bold tracking-tight">CRM-PARTIU</h1>
        </div>

       
        <div className="flex items-center gap-6">
         

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 
            transition-all text-sm font-medium shadow-md"
          >
            Sair
          </button>
        </div>
      </header>

     
      <main className="pt-24 px-6">
        {children}
      </main>
    </div>
  );
}
