"use client";

import { motion } from "framer-motion";
import { Users, Cake, UserMinus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type ActionCardProps = {
  title: string;
  icon: React.ReactNode;
  color: "blue" | "pink" | "yellow" | "purple";
  route: string;
};

const colorStyles = {
  blue: {
    bg: "bg-blue-400/20",
    text: "text-blue-400",
    shadow: "hover:shadow-blue-400/40",
  },
  pink: {
    bg: "bg-pink-400/20",
    text: "text-pink-400",
    shadow: "hover:shadow-pink-400/40",
  },
  yellow: {
    bg: "bg-yellow-400/20",
    text: "text-yellow-400",
    shadow: "hover:shadow-yellow-400/40",
  },
  purple: {
    bg: "bg-purple-400/20",
    text: "text-purple-400",
    shadow: "hover:shadow-purple-400/40",
  },
};

function ActionCard({ title, icon, color, route }: ActionCardProps) {
  const router = useRouter();
  const c = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => router.push(route)}
      className={`cursor-pointer p-5 rounded-xl bg-zinc-900/40 border border-zinc-700 
        hover:bg-zinc-900/70 ${c.shadow}
        transition flex items-center gap-4`}
    >
      <div className={`p-3 rounded-lg ${c.bg} ${c.text}`}>
        {icon}
      </div>

      <p className="text-lg font-medium">{title}</p>
    </motion.div>
  );
}

export default function DashboardActionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 mt-6 gap-4 ">

      <ActionCard
        title="Clientes"
        icon={<Users size={28} />}
        color="blue"
        route="/clients"
      />

      <ActionCard
        title="Aniversariantes"
        icon={<Cake size={28} />}
        color="pink"
        route="/birthdays"
      />

      <ActionCard
        title="Inativos"
        icon={<UserMinus size={28} />}
        color="yellow"
        route="/inactive"
      />

      <ActionCard
        title="Recentes"
        icon={<Clock size={28} />}
        color="purple"
        route="/recent"
      />

    </div>
  );
}
