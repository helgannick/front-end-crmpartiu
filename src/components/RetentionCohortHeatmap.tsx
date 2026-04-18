"use client";

interface Cohort { cohort: string; total: number; retained_30d: number; retained_60d: number; retained_90d: number; }

function pct(retained: number, total: number) {
  return total > 0 ? Math.round((retained / total) * 100) : 0;
}

function heatColor(p: number) {
  if (p >= 75) return "bg-emerald-500/70";
  if (p >= 50) return "bg-emerald-500/40";
  if (p >= 25) return "bg-yellow-500/40";
  return "bg-red-500/30";
}

function exportCSV(data: Cohort[]) {
  const header = "Coorte,Total,Retido 30d,Retido 60d,Retido 90d";
  const rows = data.map((c) =>
    `${c.cohort},${c.total},${pct(c.retained_30d, c.total)}%,${pct(c.retained_60d, c.total)}%,${pct(c.retained_90d, c.total)}%`
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "cohorts_retencao.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function RetentionCohortHeatmap({ data }: { data: Cohort[] }) {
  if (!data || data.length === 0) return <p className="text-sm opacity-60">Sem dados de coorte</p>;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h2 className="text-xl font-semibold">Retenção por Coorte</h2>
        <button onClick={() => exportCSV(data)}
          className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/50 text-left">
              <th className="pb-2 pr-4">Coorte</th>
              <th className="pb-2 pr-4 text-center">Total</th>
              <th className="pb-2 pr-4 text-center">30 dias</th>
              <th className="pb-2 pr-4 text-center">60 dias</th>
              <th className="pb-2 text-center">90 dias</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => {
              const p30 = pct(c.retained_30d, c.total);
              const p60 = pct(c.retained_60d, c.total);
              const p90 = pct(c.retained_90d, c.total);
              return (
                <tr key={c.cohort} className="border-t border-white/5">
                  <td className="py-2 pr-4 font-medium">{c.cohort}</td>
                  <td className="py-2 pr-4 text-center text-white/60">{c.total}</td>
                  {[p30, p60, p90].map((p, i) => (
                    <td key={i} className="py-2 pr-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${heatColor(p)}`}>
                        {p}%
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />≥75%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/40 inline-block" />≥50%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500/40 inline-block" />≥25%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/30 inline-block" />&lt;25%</span>
      </div>
    </div>
  );
}
