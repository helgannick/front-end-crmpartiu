"use client";

import { motion } from "framer-motion";
import { Users, CalendarDays, BarChart3 } from "lucide-react";

type DashboardCardsProps = {
  total: number;
  week: number;
  month: number;
};

type CardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  borderColor: string;
};

function Card({ title, value, icon, borderColor }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-zinc-900/50 p-5 rounded-xl border-l-4 ${borderColor} shadow-md flex items-center gap-4 hover:bg-zinc-900/70 transition`}
    >
      <div className="p-2 rounded-lg bg-zinc-800">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{title}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardCards({ total, week, month }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      <Card
        title="Total de Clientes"
        value={total}
        icon={<Users size={28} className="text-blue-400" />}
        borderColor="border-blue-500"
      />

      <Card
        title="Clientes Semana"
        value={week}
        icon={<CalendarDays size={28} className="text-green-400" />}
        borderColor="border-green-500"
      />

      <Card
        title="Clientes no Mês"
        value={month}
        icon={<BarChart3 size={28} className="text-purple-400" />}
        borderColor="border-purple-500"
      />
    </div>
  );
}
