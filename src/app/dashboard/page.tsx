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
import ConversionFunnelChart from "@/components/ConversionFunnelChart";
import EngagementTrendChart from "@/components/EngagementTrendChart";
import TopSourcesPieChart from "@/components/TopSourcesPieChart";
import InactiveClientsList from "@/components/InactiveClientsList";
import RetentionCohortHeatmap from "@/components/RetentionCohortHeatmap";
import BirthdayPanel from "@/components/BirthdayPanel";
import HotLeadsList from "@/components/HotLeadsList";

interface CityStats { city: string; total: number; }

const TABS = ["Visão Geral", "Aniversários", "Conversão", "Engajamento", "Retenção"] as const;
type Tab = typeof TABS[number];

const PERIOD_OPTIONS = [
  { label: "30 dias",  days: 30 },
  { label: "90 dias",  days: 90 },
  { label: "6 meses",  days: 180 },
  { label: "1 ano",    days: 365 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [advancedLoading, setAdvancedLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Visão Geral");
  const [inactiveDays, setInactiveDays] = useState(30);

  const [stats, setStats] = useState({
    total: 0, weekly: 0, monthly: 0,
    birthdays: [] as BirthdayClient[], recent: [] as Client[],
    active: 0, inactive: 0,
  });
  const [clientsByCity, setClientsByCity] = useState<CityStats[]>([]);

  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [inactiveData, setInactiveData] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);

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
        apiFetch("/dashboard/hot-leads"),
      ]);

      const [total, weekly, monthly, birthdays, recent, status, byCity, hotLeadsData] =
        results.map((r) => r.status === "fulfilled" ? r.value : null);

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
        return [];
      })();
      setClientsByCity(normalizedByCity);
      setHotLeads(Array.isArray(hotLeadsData) ? hotLeadsData : []);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvanced = async () => {
    setAdvancedLoading(true);
    try {
      const [f, t, s, i, c] = await Promise.all([
        apiFetch("/dashboard/conversion-funnel"),
        apiFetch("/dashboard/engagement-trends"),
        apiFetch("/dashboard/top-sources"),
        apiFetch(`/dashboard/inactive-clients?days=${inactiveDays}`),
        apiFetch("/dashboard/retention-cohorts"),
      ]);
      setFunnel(f);
      setTrends(Array.isArray(t) ? t : []);
      setSources(Array.isArray(s) ? s : []);
      setInactiveData(i);
      setCohorts(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error("Erro ao carregar métricas avançadas:", err);
    } finally {
      setAdvancedLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    if (activeTab !== "Visão Geral") loadAdvanced();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, inactiveDays]);

  return (
    <Protected>
      <Header />

      <div className="min-h-screen p-8 pt-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {loading ? (
          <div className="flex items-center justify-center h-[70vh]">
            <div className="w-14 h-14 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
              <div className="flex gap-2">
                <button onClick={() => setShowImportModal(true)}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 font-semibold text-sm">
                  Importar planilha
                </button>
                <button onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-semibold">
                  + Novo cliente
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* ── TAB: Visão Geral ── */}
            {activeTab === "Visão Geral" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <DashboardCards total={stats.total} week={stats.weekly} month={stats.monthly} />
                </div>
                <DashboardQuickStats
                  active={stats.active}
                  inactive={stats.inactive}
                  birthdays={stats.birthdays.length}
                  recent={stats.recent.length}
                  onInactiveClick={() => setActiveTab("Engajamento")}
                  onBirthdaysClick={() => setActiveTab("Aniversários")}
                  onRecentClick={() =>
                    document.getElementById("recent-clients")?.scrollIntoView({ behavior: "smooth" })
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <BirthdayList clients={stats.birthdays} onUpdated={loadStats} />
                  <div id="recent-clients"><RecentClients clients={stats.recent} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <ClientsByCityChart data={clientsByCity} />
                  <HotLeadsList leads={hotLeads} />
                </div>
              </>
            )}

            {/* ── TAB: Aniversários ── */}
            {activeTab === "Aniversários" && <BirthdayPanel />}

            {/* ── TABS AVANÇADAS ── */}
            {activeTab !== "Visão Geral" && activeTab !== "Aniversários" && (
              <>
                {/* Filtro de período para inativos */}
                {activeTab === "Engajamento" && (
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm text-white/60">Inativos há mais de:</span>
                    <div className="flex gap-1">
                      {PERIOD_OPTIONS.map(({ label, days }) => (
                        <button key={days} onClick={() => setInactiveDays(days)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            inactiveDays === days ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {advancedLoading ? (
                  <div className="flex items-center justify-center h-[40vh]">
                    <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {activeTab === "Conversão" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ConversionFunnelChart data={funnel} />
                        <TopSourcesPieChart data={sources} />
                      </div>
                    )}

                    {activeTab === "Engajamento" && (
                      <div className="grid grid-cols-1 gap-6">
                        <EngagementTrendChart data={trends} />
                        <InactiveClientsList data={inactiveData} days={inactiveDays} />
                      </div>
                    )}

                    {activeTab === "Retenção" && (
                      <RetentionCohortHeatmap data={cohorts} />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {showCreateModal && (
          <ClientCreateModal onClose={() => setShowCreateModal(false)} onCreated={loadStats} />
        )}
        {showImportModal && (
          <ImportClientsModal onClose={() => setShowImportModal(false)} onImported={loadStats} />
        )}
      </div>
    </Protected>
  );
}
