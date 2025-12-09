"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
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
      <div className="flex items-center gap-3">
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
      </div>

      {/* Botão de logout */}
      <button
        onClick={handleLogout}
        className="
          flex items-center gap-2
          px-4 py-2
          bg-white/10 hover:bg-white/20
          rounded-xl border border-white/10
          transition-all
          text-white
        "
      >
        <LogOut size={18} />
        Sair
      </button>
    </header>
  );
}
