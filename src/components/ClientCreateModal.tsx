"use client";

import { useState, useEffect } from "react";
import apiFetch from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

interface Genre {
  id: string;
  name: string;
}

export default function ClientCreateModal({ onClose, onCreated }: Props) {
  const [genresList, setGenresList] = useState<Genre[]>([]);

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
  gender: "",
});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGenres() {
      try {
        const data = await apiFetch("/music-genres");
        setGenresList(data || []);
      } catch (err) {
        console.error("Erro ao carregar gêneros", err);
      }
    }
    loadGenres();
  }, []);

  function toggleGenre(id: string) {
    setForm((prev) => ({
      ...prev,
      music_genres: prev.music_genres.includes(id)
        ? prev.music_genres.filter((g) => g !== id)
        : [...prev.music_genres, id],
    }));
  }

  async function handleCreate() {
  try {
    setLoading(true);

    // ✅ Monta o birth_date no formato YYYY-MM-DD
    const day = String(form.birthday_day).padStart(2, "0");
    const month = String(form.birthday_month).padStart(2, "0");
    const year = String(form.birthday_year);
    const birth_date = day && month && year ? `${year}-${month}-${day}` : null;

    await apiFetch("/clients", {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        city: form.city,
        phone: form.phone,
        gender: form.gender,
        lead_source: form.lead_source,
        favorite_event: form.favorite_event,
        last_event: form.last_event,
        bought_with_partiu: form.bought_with_partiu,
        music_genres: form.music_genres,
        music_genre_other: form.music_genre_other,
        birth_date, // ✅ envia a data montada corretamente
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

          <select
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">Gênero</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
          </select>

          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="Dia"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_day}
              onChange={(e) => setForm({ ...form, birthday_day: e.target.value })}
            />
            <input
              placeholder="Mês"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_month}
              onChange={(e) => setForm({ ...form, birthday_month: e.target.value })}
            />
            <input
              placeholder="Ano"
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_year}
              onChange={(e) => setForm({ ...form, birthday_year: e.target.value })}
            />
          </div>

          <select
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.lead_source}
            onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
          >
            <option value="">Origem do lead</option>
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
            onChange={(e) => setForm({ ...form, favorite_event: e.target.value })}
          />

          <input
            placeholder="Último evento que foi"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.last_event}
            onChange={(e) => setForm({ ...form, last_event: e.target.value })}
          />

          {/* Gêneros musicais — carregados da API */}
          <div className="space-y-1">
            <p className="text-sm opacity-70">Gêneros musicais</p>
            <div className="flex flex-wrap gap-2">
              {genresList.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    form.music_genres.includes(g.id)
                      ? "bg-blue-600 border-blue-500"
                      : "border-white/20 hover:bg-white/10"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <input
            placeholder="Outro gênero (opcional)"
            className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
            value={form.music_genre_other}
            onChange={(e) => setForm({ ...form, music_genre_other: e.target.value })}
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