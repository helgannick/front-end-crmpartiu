"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/api";

type MessageStatus = {
  status: "pending_reply" | "sending" | "sent" | "failed" | "expired";
  campaign: string;
} | null;

type PanelClient = {
  id: string;
  name: string;
  phone?: string;
  birth_date?: string;
  bought_with_partiu?: boolean;
  birthday_converted_year?: number;
  messageStatus: MessageStatus;
};

type PanelData = {
  d7: { count: number; clients: PanelClient[] };
  d0: { count: number; clients: PanelClient[] };
  stats: { sentThisYear: number; convertedThisYear: number; year: number };
};

function StatusBadge({ ms, convertedYear, currentYear }: { ms: MessageStatus; convertedYear?: number | null; currentYear: number }) {
  if (convertedYear === currentYear) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">🏆 Convertido</span>;
  }
  if (!ms) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/40">⚪ Não enviado</span>;
  }
  if (ms.campaign === "birthday_converted") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">🏆 Convertido</span>;
  }
  if (ms.status === "pending_reply") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300">💬 Aguardando resposta</span>;
  }
  if (ms.status === "sent") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">✅ Enviado</span>;
  }
  if (ms.status === "failed") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">❌ Falhou</span>;
  }
  if (ms.status === "expired") {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/40">⏰ Expirado</span>;
  }
  return null;
}

function ClientCard({ client, currentYear }: { client: PanelClient; currentYear: number }) {
  const phone = client.phone?.replace(/\D/g, "") ?? "";
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{client.name}</p>
        {client.phone && (
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            className="text-xs text-white/40 hover:text-emerald-400 transition"
          >
            {client.phone}
          </a>
        )}
      </div>
      <StatusBadge ms={client.messageStatus} convertedYear={client.birthday_converted_year} currentYear={currentYear} />
    </div>
  );
}

function Section({ title, emoji, clients, currentYear }: { title: string; emoji: string; clients: PanelClient[]; currentYear: number }) {
  if (clients.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-base mb-3">{emoji} {title}</h3>
        <p className="text-sm text-white/40">Nenhum aniversariante {title.toLowerCase()}.</p>
      </div>
    );
  }
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-bold text-base mb-3">{emoji} {title} <span className="text-white/40 font-normal text-sm">({clients.length})</span></h3>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {clients.map(c => <ClientCard key={c.id} client={c} currentYear={currentYear} />)}
      </div>
    </div>
  );
}

export default function BirthdayPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<"d7" | "d0" | "both" | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/birthday/panel");
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerJob(type: "d7" | "d0" | "both") {
    setTriggering(type);
    try {
      const route = type === "both" ? "/api/birthday/run" : `/api/birthday/run/${type}`;
      await apiFetch(route, { method: "POST" });
      alert(`Job ${type.toUpperCase()} iniciado! Os envios acontecem em background com delay de 3-8 min entre clientes.`);
      setTimeout(load, 3000);
    } catch (err: any) {
      alert(err?.message || "Erro ao disparar job");
    } finally {
      setTriggering(null);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-white/40 text-sm">Erro ao carregar painel.</p>;

  const { d7, d0, stats } = data;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Aniversários hoje", value: d0.count, color: "text-pink-400" },
          { label: "Aniversários em 7 dias", value: d7.count, color: "text-yellow-400" },
          { label: `Mensagens enviadas ${stats.year}`, value: stats.sentThisYear, color: "text-blue-400" },
          { label: `Convertidos ${stats.year}`, value: stats.convertedThisYear, color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-white/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Botões de disparo manual */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => triggerJob("d7")}
          disabled={!!triggering}
          className="rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 px-4 py-2 text-sm font-semibold text-yellow-300 transition disabled:opacity-50"
        >
          {triggering === "d7" ? "Disparando..." : "▶ Disparar D-7"}
        </button>
        <button
          onClick={() => triggerJob("d0")}
          disabled={!!triggering}
          className="rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 px-4 py-2 text-sm font-semibold text-pink-300 transition disabled:opacity-50"
        >
          {triggering === "d0" ? "Disparando..." : "▶ Disparar D-0"}
        </button>
        <button
          onClick={load}
          className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition"
        >
          ↻ Atualizar
        </button>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Aniversário hoje" emoji="🎉" clients={d0.clients} currentYear={stats.year} />
        <Section title="Aniversário em 7 dias" emoji="📅" clients={d7.clients} currentYear={stats.year} />
      </div>
    </div>
  );
}
