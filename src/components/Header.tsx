"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
  }
  return (
    <header
      className="
        fixed top-0 left-0 w-full h-16 
        bg-gradient-to-r from-gray-800/70 to-gray-900/60 
        backdrop-blur-2xl 
        border-b border-white/10
        px-6 flex items-center justify-between
        z-50 shadow-lg
      "
    >
      {/* Lado esquerdo */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/Logo-Partiu-Pra-Boa-foguete.svg"
            width={36}
            height={36}
            alt="Partiu Logo"
            className="rounded-full"
          />
          <span className="text-lg font-semibold tracking-wide text-white">
            CRM-PARTIU
          </span>
        </Link>

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="
    flex items-center gap-2
    px-4 py-2
    bg-white/10 hover:bg-white/20
    rounded-xl border border-white/10
    transition-all
    text-white
    disabled:opacity-50
  "
      >
        {loggingOut ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <LogOut size={18} />
        )}
        {loggingOut ? "Saindo..." : "Sair"}
      </button>
    </header>
  );
}