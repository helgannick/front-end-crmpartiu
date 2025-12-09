"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import apiFetch from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Users, UserPlus, Calendar } from "lucide-react";

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
      <div className="p-4">

        {loading && (
          <div className="flex items-center justify-center h-[70vh] animate-fade-in">
            <div className="w-14 h-14 border-[4px] border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && (
          <>
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
              Dashboard
            </h1>

           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card title="Total de Clientes" value={stats.total} />
              <Card title="Novos na Semana" value={stats.weekly} />
              <Card title="Novos no Mês" value={stats.monthly} />
            </div>

           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Block title="Aniversariantes do Mês">
                {stats.birthdays.length === 0 && <p>Nenhum aniversariante.</p>}
                <ul className="space-y-2">
                  {stats.birthdays.map((c) => (
                    <li
                      key={c.id}
                      className="bg-white/10 rounded-lg p-3 flex justify-between items-center
                        border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <span>{c.name}</span>
                      <span className="opacity-70 text-sm">
                        {c.birthday_day}/{c.birthday_month}
                      </span>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title="Últimos Cadastrados">
                {stats.recent.length === 0 && <p>Nenhum cliente recente.</p>}
                <ul className="space-y-2">
                  {stats.recent.map((c) => (
                    <li
                      key={c.id}
                      className="bg-white/10 rounded-lg p-3 flex justify-between items-center
                        border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <span>{c.name}</span>
                      <span className="opacity-70 text-sm">{c.email}</span>
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
  const iconMap: Record<string, JSX.Element> = {
    "Total de Clientes": <Users className="w-6 h-6" />,
    "Novos na Semana": <UserPlus className="w-6 h-6" />,
    "Novos no Mês": <Calendar className="w-6 h-6" />,
  };

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl
      border border-white/20 hover:bg-white/20 transition-all duration-300 
      cursor-default group">

      <div className="flex items-center justify-between">
        <p className="text-sm opacity-80">{title}</p>
        <div className="opacity-60 group-hover:opacity-100 transition">
          {iconMap[title]}
        </div>
      </div>

      <h2 className="text-4xl font-bold mt-2 tracking-tight">
        {value}
      </h2>
    </div>
  );
}


function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl 
      border border-white/20 min-h-[220px] hover:bg-white/20 transition-all duration-300">

      <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">
        {title}
      </h2>

      {children}
    </div>
  );
}
