"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import apiFetch from "@/lib/api";
import { getToken } from "@/lib/auth";
import Header from "@/components/Header";
import DashboardCards from "@/components/DashboardCards";
import DashboardQuickStats from "@/components/DashboardQuickStats";
import BirthdayList from "@/components/BirthdayList";
import RecentClients from "@/components/RecentClients";
import ClientsByCityChart from "@/components/ClientsByCityChart";

interface Client {
  id: string;
  name: string;
  email?: string;
  birthday_day?: number;
  birthday_month?: number;
  birthday_year?: number;
}

interface CityStats {
  city: string;
  total: number;
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

  const [clientsByCity, setClientsByCity] = useState<CityStats[]>([]);

  const loadStats = async () => {
    try {
      const token = getToken();

      const results = await Promise.allSettled([
        apiFetch("/dashboard/total", { token }),
        apiFetch("/dashboard/week", { token }),
        apiFetch("/dashboard/month", { token }),
        apiFetch("/dashboard/birthdays", { token }),
        apiFetch("/dashboard/recent", { token }),
        apiFetch("/dashboard/status", { token }),
        apiFetch("/dashboard/clients-by-city", { token }),
      ]);

      const [
        total,
        weekly,
        monthly,
        birthdays,
        recent,
        status,
        byCity,
      ] = results.map((r) =>
        r.status === "fulfilled" ? r.value : null
      );

      setStats({
        total: total?.total ?? 0,
        weekly: weekly?.new_clients_week ?? 0,
        monthly: monthly?.new_clients_month ?? 0,
        birthdays: Array.isArray(birthdays) ? birthdays : [],
        recent: Array.isArray(recent) ? recent : [],
        active: status?.active ?? 0,
        inactive: status?.inactive ?? 0,
      });

      // 🔑 NORMALIZAÇÃO DEFINITIVA DO byCity
      const normalizedByCity: CityStats[] = (() => {
        if (Array.isArray(byCity)) return byCity;
        if (Array.isArray(byCity?.data)) return byCity.data;
        if (Array.isArray(byCity?.result)) return byCity.result;
        return [];
      })();

      console.log("Clients by city (final):", normalizedByCity);

      setClientsByCity([...normalizedByCity]);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const [birthdays, setBirthdays] = useState<BirthdayClient[]>([]);

  const loadBirthdays = async () => {
    const data = await apiFetch("/clients", {
      params: { month: new Date().getMonth() + 1 },
    });

    setBirthdays(data.data);
  };

  useEffect(() => {
    loadBirthdays();
  }, []);

  return (
    <Protected>
      <Header />

      <div className="min-h-screen p-8 pt-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {loading && (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-14 h-14 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
              Dashboard
            </h1>

            {/* Cards principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <DashboardCards
                total={stats.total}
                week={stats.weekly}
                month={stats.monthly}
              />
            </div>

            {/* Estatísticas rápidas */}
            <DashboardQuickStats
              active={stats.active}
              inactive={stats.inactive}
              birthdays={stats.birthdays.length}
              recent={stats.recent.length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <BirthdayList
                clients={birthdays}
                onUpdated={loadBirthdays}
              />

              <RecentClients clients={stats.recent} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <ClientsByCityChart data={clientsByCity} />
            </div>
          </>
        )}
      </div>
    </Protected>
  );
}
