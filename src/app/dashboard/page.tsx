"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import apiFetch from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Client {
  id: string;
  name: string;
  email?: string;
  birthday_day?: number;
  birthday_month?: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    weekly: 0,
    monthly: 0,
    birthdays: [] as Client[],
    recent: [] as Client[],
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const token = getToken();

      const [total, weekly, monthly, birthdays, recent, status] =
        await Promise.all([
          apiFetch("/dashboard/total", { token }),
          apiFetch("/dashboard/week", { token }),
          apiFetch("/dashboard/month", { token }),
          apiFetch("/dashboard/birthdays", { token }),
          apiFetch("/dashboard/recent", { token }),
          apiFetch("/dashboard/status", { token }),
        ]);

      setStats({
        total: total.total,
        weekly: weekly.new_clients_week,
        monthly: monthly.new_clients_month,
        birthdays: birthdays || [],
        recent: recent || [],
        active: status.active,
        inactive: status.inactive,
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <Protected>
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">

        {/* LOADING SPINNER */}
        {loading && (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card title="Total de Clientes" value={stats.total} />
              <Card title="Novos na Semana" value={stats.weekly} />
              <Card title="Novos no Mês" value={stats.monthly} />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Block title="Aniversariantes do Mês">
                {stats.birthdays.length === 0 && <p>Nenhum aniversariante.</p>}
                <ul className="space-y-2">
                  {stats.birthdays.map((c) => (
                    <li key={c.id} className="bg-white/10 rounded p-2">
                      {c.name} — {c.birthday_day}/{c.birthday_month}
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title="Últimos Cadastrados">
                {stats.recent.length === 0 && <p>Nenhum cliente recente.</p>}
                <ul className="space-y-2">
                  {stats.recent.map((c) => (
                    <li key={c.id} className="bg-white/10 rounded p-2">
                      {c.name} — {c.email}
                    </li>
                  ))}
                </ul>
              </Block>

            </div>
          </>
        )}

      </div>
    </Protected>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20">
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-3xl font-bold mt-1">{value}</h2>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20 min-h-[200px]">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
