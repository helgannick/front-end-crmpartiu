"use client";

interface InactiveClient { id: string; name: string; last_interaction: string | null; days_inactive: number; }
interface InactiveData { count: number; percentage: number; clients: InactiveClient[]; }

function exportCSV(clients: InactiveClient[]) {
  const header = "Nome,Última Interação,Dias Inativo";
  const rows = clients.map((c) =>
    `"${c.name}","${c.last_interaction ? new Date(c.last_interaction).toLocaleDateString("pt-BR") : "Nunca"}",${c.days_inactive}`
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "clientes_inativos.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function InactiveClientsList({ data, days }: { data: InactiveData | null; days: number }) {
  if (!data) return <p className="text-sm opacity-60">Sem dados</p>;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h2 className="text-xl font-semibold">
          Clientes Inativos <span className="text-sm font-normal text-white/50">({days}+ dias)</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">{data.count} clientes ({data.percentage}%)</span>
          {data.clients.length > 0 && (
            <button onClick={() => exportCSV(data.clients)}
              className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              Exportar CSV
            </button>
          )}
        </div>
      </div>
      {data.clients.length === 0 ? (
        <p className="text-sm opacity-60 text-center py-4">Nenhum cliente inativo 🎉</p>
      ) : (
        <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#111827]">
              <tr className="text-white/50 text-left">
                <th className="pb-2 pr-4">Nome</th>
                <th className="pb-2 pr-4">Última interação</th>
                <th className="pb-2 text-right">Dias inativo</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-4 font-medium">{c.name}</td>
                  <td className="py-2 pr-4 text-white/60">
                    {c.last_interaction ? new Date(c.last_interaction).toLocaleDateString("pt-BR") : "Nunca"}
                  </td>
                  <td className="py-2 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.days_inactive > 90 ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                      {c.days_inactive}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
