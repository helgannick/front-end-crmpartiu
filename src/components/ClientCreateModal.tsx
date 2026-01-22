"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const MUSIC_OPTIONS = [
  "pagode",
  "funk",
  "samba",
  "sertanejo",
  "e-music",
  "axe",
];

export default function ClientCreateModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    phone: "",
    birthday_day: "",
    birthday_month: "",
    birthday_year: "",

    lead_source: "",
    favorite_event: "",
    last_event: "",
    bought_with_partiu: false,
    music_genres: [] as string[],
    music_genre_other: "",

    // ✅ novo campo
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  function toggleGenre(genre: string) {
    setForm((prev) => ({
      ...prev,
      music_genres: prev.music_genres.includes(genre)
        ? prev.music_genres.filter((g) => g !== genre)
        : [...prev.music_genres, genre],
    }));
  }

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
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 shadow-xl p-6 text-white overflow-y-auto max-h-[90vh]">
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
            placeholder="Telefone / WhatsApp"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          {/* ✅ Gênero */}
          <select
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gênero</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>

          {/* Aniversário */}
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

          {/* Origem */}
          <select
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.lead_source}
            onChange={(e) =>
              setForm({ ...form, lead_source: e.target.value })
            }
          >
            <option label="Origem do lead"></option>
            <option value="Instagram">Instagram</option>
            <option value="Evento">Evento</option>
            <option value="Cupom">Cupom</option>
            <option value="Grupo WhatsApp">Grupo WhatsApp</option>
            <option value="Outro">Outro</option>
          </select>

          <input
            placeholder="Evento favorito"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.favorite_event}
            onChange={(e) =>
              setForm({ ...form, favorite_event: e.target.value })
            }
          />

          <input
            placeholder="Último evento que foi"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.last_event}
            onChange={(e) => setForm({ ...form, last_event: e.target.value })}
          />

          {/* Gêneros musicais */}
          <div className="space-y-1">
            <p className="text-sm opacity-70">Gêneros musicais</p>
            <div className="flex flex-wrap gap-2">
              {MUSIC_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    form.music_genres.includes(g)
                      ? "bg-blue-600 border-blue-500"
                      : "border-white/20 hover:bg-white/10"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <input
            placeholder="Outro gênero (opcional)"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.music_genre_other}
            onChange={(e) =>
              setForm({ ...form, music_genre_other: e.target.value })
            }
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.bought_with_partiu}
              onChange={(e) =>
                setForm({ ...form, bought_with_partiu: e.target.checked })
              }
            />
            Já comprou ingresso com a PARTIU?
          </label>
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
