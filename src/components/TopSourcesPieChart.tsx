"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Source { source: string; count: number; percentage: number; [key: string]: unknown; }

const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#FB923C"];

export default function TopSourcesPieChart({ data }: { data: Source[] }) {
  if (!data || data.length === 0) return <p className="text-sm opacity-60">Sem dados de origem</p>;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Top Origens de Leads</h2>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              formatter={(value, name, props) => [`${value ?? 0} (${(props.payload as Source).percentage}%)`, name]}
            />
            <Legend formatter={(value) => <span className="text-white text-xs">{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
