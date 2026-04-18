"use client";

import type { BirthdayClient, Client } from "../../../@/types/client";


import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import apiFetch from "@/lib/api";

import Header from "@/components/Header";
import DashboardCards from "@/components/DashboardCards";
import DashboardQuickStats from "@/components/DashboardQuickStats";
import BirthdayList from "@/components/BirthdayList";
import RecentClients from "@/components/RecentClients";
import ClientsByCityChart from "@/components/ClientsByCityChart";
import ClientCreateModal from "@/components/ClientCreateModal";
import ImportClientsModal from "@/components/ImportClientsModal";

/* =======================
   TIPOS
======================= */



interface CityStats {
  city: string;
  total: number;
}

/* =======================
   COMPONENTE
======================= */

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    weekly: 0,
    monthly: 0,
    birthdays: [] as BirthdayClient[],
    recent: [] as Client[],
    active: 0,
    inactive: 0,
  });

  const [clientsByCity, setClientsByCity] = useState<CityStats[]>([]);

  const loadStats = async () => {
    try {
      const results = await Promise.allSettled([
        apiFetch("/dashboard/total"),
        apiFetch("/dashboard/week"),
        apiFetch("/dashboard/month"),
        apiFetch("/dashboard/birthdays"),
        apiFetch("/dashboard/recent"),
        apiFetch("/dashboard/status"),
        apiFetch("/dashboard/clients-by-city"),
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

      const normalizedByCity: CityStats[] = (() => {
        if (Array.isArray(byCity)) return byCity;
        if (Array.isArray(byCity?.data)) return byCity.data;
        if (Array.isArray(byCity?.result)) return byCity.result;
        return [];
      })();

      setClientsByCity(normalizedByCity);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight">
                Dashboard
              </h1>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 font-semibold text-sm"
                >
                  Importar planilha
                </button>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-semibold"
                >
                  + Novo cliente
                </button>
              </div>
            </div>

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
                clients={stats.birthdays}
                onUpdated={loadStats}
              />

              <RecentClients clients={stats.recent} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <ClientsByCityChart data={clientsByCity} />
            </div>
          </>
        )}

        {showCreateModal && (
          <ClientCreateModal
            onClose={() => setShowCreateModal(false)}
            onCreated={loadStats}
          />
        )}

        {showImportModal && (
          <ImportClientsModal
            onClose={() => setShowImportModal(false)}
            onImported={loadStats}
          />
        )}
      </div>
    </Protected>
  );
}
