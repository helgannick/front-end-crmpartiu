"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Trend { month: string; active_clients: number; avg_interactions: number; }

export default function EngagementTrendChart({ data }: { data: Trend[] }) {
  if (!data || data.length === 0) return <p className="text-sm opacity-60">Sem dados de engajamento</p>;

  const formatted = data.map((d) => ({ ...d, month: d.month.slice(5) + "/" + d.month.slice(2, 4) }));

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Tendência de Engajamento</h2>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <XAxis dataKey="month" stroke="#E5E7EB" />
            <YAxis yAxisId="left" stroke="#60A5FA" />
            <YAxis yAxisId="right" orientation="right" stroke="#34D399" />
            <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="active_clients" name="Clientes ativos" stroke="#60A5FA" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="avg_interactions" name="Média interações" stroke="#34D399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
