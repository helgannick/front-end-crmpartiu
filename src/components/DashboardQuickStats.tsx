"use client";

import { motion } from "framer-motion";
import { Users, UserMinus, Cake, Clock } from "lucide-react";

type StatProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ label, value, icon, color }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`p-4 rounded-xl bg-zinc-900/40 border border-zinc-700
        flex items-center gap-3 hover:bg-zinc-900/70 
        transition`}
    >
      <div className={`p-2 rounded-lg bg-${color}/20 text-${color}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </motion.div>
  );
}

export default function DashboardQuickStats({
  active,
  inactive,
  birthdays,
  recent,
}: {
  active: number;
  inactive: number;
  birthdays: number;
  recent: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">

      <StatCard
        label="Ativos"
        value={active}
        icon={<Users size={22} />}
        color="green-400"
      />

      <StatCard
        label="Inativos"
        value={inactive}
        icon={<UserMinus size={22} />}
        color="red-400"
      />

      <StatCard
        label="Aniversariantes"
        value={birthdays}
        icon={<Cake size={22} />}
        color="pink-400"
      />

      <StatCard
        label="Recentes"
        value={recent}
        icon={<Clock size={22} />}
        color="purple-400"
      />

    </div>
  );
}
