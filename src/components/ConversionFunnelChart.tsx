"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface FunnelData {
  novo: number; engajando: number; recorrente: number; vip: number;
  conversion_rate: { novo_to_engajando: number; engajando_to_recorrente: number; recorrente_to_vip: number };
}

const STEPS = [
  { key: "novo",       label: "Novo",       color: "#60A5FA" },
  { key: "engajando",  label: "Engajando",  color: "#34D399" },
  { key: "recorrente", label: "Recorrente", color: "#A78BFA" },
  { key: "vip",        label: "VIP",        color: "#FBBF24" },
];

export default function ConversionFunnelChart({ data }: { data: FunnelData | null }) {
  if (!data) return <p className="text-sm opacity-60">Sem dados</p>;

  const chartData = STEPS.map(({ key, label }) => ({ label, value: (data as any)[key] }));

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Funil de Conversão</h2>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" stroke="#E5E7EB" />
            <YAxis dataKey="label" type="category" stroke="#E5E7EB" width={80} />
            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={STEPS[i].color} />)}
              <LabelList dataKey="value" position="right" fill="#fff" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/60">
        <div>Novo→Engaj. <span className="block text-white font-semibold text-sm">{data.conversion_rate.novo_to_engajando}%</span></div>
        <div>Engaj.→Recorr. <span className="block text-white font-semibold text-sm">{data.conversion_rate.engajando_to_recorrente}%</span></div>
        <div>Recorr.→VIP <span className="block text-white font-semibold text-sm">{data.conversion_rate.recorrente_to_vip}%</span></div>
      </div>
    </div>
  );
}
