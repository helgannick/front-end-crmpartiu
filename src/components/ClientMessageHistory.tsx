"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/api";

type MessageLog = {
  id: string;
  status: "pending_reply" | "sending" | "sent" | "failed" | "expired";
  message_body: string;
  sent_at: string;
  metadata?: {
    campaign?: string;
    campaign_year?: number;
  };
};

const CAMPAIGN_LABELS: Record<string, string> = {
  birthday_d7: "🎁 Pré-aniversário (D-7)",
  birthday_d0: "🎂 Aniversário (D-0)",
  birthday_d0_simple: "🎂 Parabéns (D-0)",
  birthday_converted: "🏆 Conversão registrada",
};

const STATUS_BADGE: Record<string, string> = {
  sent: "bg-blue-500/20 text-blue-300",
  pending_reply: "bg-yellow-500/20 text-yellow-300",
  sending: "bg-white/10 text-white/50",
  failed: "bg-red-500/20 text-red-300",
  expired: "bg-white/10 text-white/40",
};

const STATUS_LABEL: Record<string, string> = {
  sent: "Enviado",
  pending_reply: "Aguardando resposta",
  sending: "Enviando...",
  failed: "Falhou",
  expired: "Expirado",
};

export default function ClientMessageHistory({ clientId }: { clientId: string }) {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/clients/${clientId}/messages`)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-white/40 text-center py-8">
        Nenhuma mensagem enviada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const campaign = log.metadata?.campaign;
        const campaignLabel = campaign ? CAMPAIGN_LABELS[campaign] : null;
        const date = new Date(log.sent_at).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });

        return (
          <div key={log.id} className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-white/40">{date}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[log.status] ?? "bg-white/10 text-white/50"}`}>
                {STATUS_LABEL[log.status] ?? log.status}
              </span>
            </div>
            {campaignLabel && (
              <p className="text-xs font-semibold text-white/60">{campaignLabel}</p>
            )}
            {log.message_body && log.message_body !== "[CONVERSÃO REGISTRADA]" && (
              <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                {log.message_body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
