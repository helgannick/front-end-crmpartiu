"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function ClientCreateModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
    birthday_day: "",
    birthday_month: "",
    birthday_year: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    try {
      setLoading(true);

      await apiFetch("/clients", {
        method: "POST",
        body: {
          ...form,
          birthday_day: Number(form.birthday_day),
          birthday_month: Number(form.birthday_month),
          birthday_year: Number(form.birthday_year),
        },
      });

      onCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-5">Novo cliente</h2>

        <div className="space-y-3">
          <input
            placeholder="Nome"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            placeholder="Cidade"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <input
            placeholder="Telefone"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="Dia"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_day}
              onChange={(e) =>
                setForm({ ...form, birthday_day: e.target.value })
              }
            />
            <input
              placeholder="Mês"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_month}
              onChange={(e) =>
                setForm({ ...form, birthday_month: e.target.value })
              }
            />
            <input
              placeholder="Ano"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_year}
              onChange={(e) =>
                setForm({ ...form, birthday_year: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Criar cliente"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 font-semibold"
          >
            Cancelar
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
