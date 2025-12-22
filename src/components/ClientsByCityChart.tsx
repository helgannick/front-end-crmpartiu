"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type CityData = {
  city: string;
  total: number;
};

export default function ClientsByCityChart({
  data,
}: {
  data: CityData[];
}) {
  if (!data || data.length === 0) {
    return (
      <p className="opacity-70 text-sm">
        Nenhum dado de cidade disponível
      </p>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl
      border border-white/20 hover:bg-white/20 transition-all duration-300">

      <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">
        Clientes por cidade
      </h2>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="city"
              stroke="#E5E7EB"   // cinza claro
            />
            <YAxis
              stroke="#E5E7EB"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="total"
              fill="#22C55E"     // verde (Tailwind emerald-500)
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
