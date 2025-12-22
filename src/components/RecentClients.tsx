"use client";

import { useState, useRef } from "react";
import ClientModal from "@/components/ClientModal";
import apiFetch from "@/lib/api";

type RecentClient = {
  id: string;
  name: string;
  email?: string;
};

type FullClient = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
  birthday_day?: number;
  birthday_month?: number;
  birthday_year?: number;
};

export default function RecentClients({
  clients = [],
  onUpdated,
}: {
  clients?: RecentClient[];
  onUpdated?: () => void;
}) {
  const [selectedClient, setSelectedClient] =
    useState<FullClient | null>(null);

  const cacheRef = useRef<Record<string, FullClient>>({});
  const [loading, setLoading] = useState(false);

  const handleOpenClient = async (client: RecentClient) => {
    // ⚡ CACHE HIT
    if (cacheRef.current[client.id]) {
      setSelectedClient(cacheRef.current[client.id]);
      return;
    }

    try {
      setLoading(true);
      const fullClient = await apiFetch(`/clients/${client.id}`);
      cacheRef.current[client.id] = fullClient;
      setSelectedClient(fullClient);
    } catch (err) {
      console.error("Erro ao carregar cliente", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20">
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">
          🆕 Últimos Clientes
        </h2>

        <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
          {clients.map((c) => (
            <li
              key={c.id}
              onClick={() => handleOpenClient(c)}
              className="cursor-pointer rounded-lg p-3 bg-white/5
                border border-white/10 hover:bg-white/10 transition-all"
            >
              <p className="font-semibold">{c.name}</p>
              {c.email && (
                <p className="text-sm opacity-80">{c.email}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ClientModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdated={onUpdated}
      />

      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
