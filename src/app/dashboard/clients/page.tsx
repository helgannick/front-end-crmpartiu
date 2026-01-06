"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import { getToken } from "@/lib/auth";
import apiFetch from "@/lib/api";
import Header from "@/components/Header";
import ClientModal, { Client } from "@/components/ClientModal";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const limit = 10;

  async function loadClients() {
    try {
      setLoading(true);
      const token = getToken();

      const res = await apiFetch(
        `/clients?search=${search}&page=${page}&limit=${limit}`,
        { token }
      );

      setClients(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Erro ao carregar clientes", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, [page]);

  return (
    <Protected>
      <Header />

      <div className="min-h-screen p-8 pt-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <h1 className="text-3xl font-bold mb-6">Clientes</h1>

        {/* Busca */}
        <div className="flex gap-4 mb-6">
          <input
            placeholder="Buscar por nome, email, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl bg-black/30 border border-white/10 p-3"
          />

          <button
            onClick={() => {
              setPage(1);
              loadClients();
            }}
            className="rounded-xl bg-white/20 hover:bg-white/30 px-5 font-medium"
          >
            Buscar
          </button>
        </div>

        {/* Lista */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-white/60">
              Carregando clientes...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center text-white/60">
              Nenhum cliente encontrado
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-black/40">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="cursor-pointer hover:bg-white/5 border-t border-white/10"
                  >
                    <td className="p-3">{client.name}</td>
                    <td className="p-3">{client.email || "-"}</td>
                    <td className="p-3">{client.city || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded bg-white/10 disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-white/60">
            Página {page} • {total} registros
          </span>

          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded bg-white/10 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      {/* Modal */}
      <ClientModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdated={loadClients}
      />
    </Protected>
  );
}
