"use client";

import { useState } from "react";
import ClientModal from "@/components/ClientModal";

type BirthdayClient = {
    id: string;
    name: string;
    email?: string;
    city?: string;
    phone?: string;
    birthday_day: number;
    birthday_month: number;
    birthday_year: number;
};

export default function BirthdayList({
    clients = [],
    onUpdated,
}: {
    clients?: BirthdayClient[];
    onUpdated?: () => void;
}) {
    const [selectedClient, setSelectedClient] =
        useState<BirthdayClient | null>(null);

    return (
        <>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl
        border border-white/20">

                <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">
                    🎂 Aniversariantes do Mês
                </h2>

                {clients.length === 0 && (
                    <p className="opacity-70 text-sm">Nenhum aniversariante.</p>
                )}

                <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
                    {clients.map((c) => {
                        const isToday =
                            c.birthday_day === new Date().getDate() &&
                            c.birthday_month === new Date().getMonth() + 1;

                        return (
                            <li
                                key={c.id}
                                onClick={() => setSelectedClient(c)}
                                className={`cursor-pointer rounded-lg p-3 flex justify-between
                border transition-all
                ${isToday
                                        ? "bg-emerald-500/20 border-emerald-400/40"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                <div>
                                    <p className="font-semibold">{c.name}</p>
                                    <p className="text-sm opacity-80">
                                        {c.birthday_day}/{c.birthday_month}
                                        {isToday && (
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/30">
                                                Hoje 🎉
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Modal */}
            <ClientModal
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onUpdated={onUpdated}
            />
        </>
    );
}
