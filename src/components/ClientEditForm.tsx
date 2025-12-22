"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
};

export default function ClientEditForm({
  client,
  onCancel,
  onSaved,
}: {
  client: Client;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: client.name,
    email: client.email || "",
    city: client.city || "",
    phone: client.phone || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      await apiFetch(`/clients/${client.id}`, {
        method: "PUT",
        body: form,
      });

      onSaved();
    } catch (err: any) {
      console.error("Erro ao atualizar cliente:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Editar cliente</h2>

      <div className="space-y-3">
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
        />

        <input
          placeholder="Cidade"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
        />

        <input
          placeholder="Telefone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        <button
          onClick={onCancel}
          className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-sm font-semibold"
        >
          Cancelar
        </button>
      </div>
    </>
  );
}
