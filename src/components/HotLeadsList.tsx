"use client";

import { Phone } from "lucide-react";

interface HotLead {
  id: string;
  name: string;
  phone?: string;
  birth_date?: string;
  contacted_at: string;
}

export default function HotLeadsList({ leads }: { leads: HotLead[] }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Leads para Atender</h2>
        {leads.length > 0 && (
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </span>
        )}
      </div>
      <p className="text-white/40 text-xs mb-4">
        Responderam ao WhatsApp de aniversário e aguardam contato humano.
      </p>

      {leads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">Nenhum lead aguardando atendimento</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{lead.name}</p>
                <p className="text-white/40 text-xs">
                  {lead.phone ?? "Sem telefone"} ·{" "}
                  {new Date(lead.contacted_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Phone size={12} />
                  Atender
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
