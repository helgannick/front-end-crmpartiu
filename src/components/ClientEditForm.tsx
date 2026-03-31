"use client";

import { useState, useEffect } from "react";
import apiFetch from "@/lib/api";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
  birth_date?: string;
  lead_source?: string | null;
  favorite_event?: { id: string; name: string } | string | null;
  last_event?: { id: string; name: string } | string | null;
  favorite_event_id?: string | null;
  bought_with_partiu?: boolean | null;
  music_genres?: string[] | null;
  music_genre_other?: string | null;
  gender?: "Masculino" | "Feminino" | string | null;
  contacted?: boolean | null;
};

function toLabel(value: { name: string } | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "object") return value.name;
  return value;
}

const LEAD_SOURCES = ["Instagram", "Evento", "Cupom", "Grupo WhatsApp", "Outro"];

export default function ClientEditForm({
  client,
  onCancel,
  onSaved,
  hideActions = false,
}: {
  client: Client;
  onCancel: () => void;
  onSaved: () => void;
  hideActions?: boolean;
}) {
  const [genresList, setGenresList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: client.name || "",
    email: client.email || "",
    city: client.city || "",
    phone: client.phone || "",
    birth_date: client.birth_date || "",
    lead_source: client.lead_source || "",
    favorite_event: toLabel(client.favorite_event),
    last_event: toLabel(client.last_event),
    bought_with_partiu: !!client.bought_with_partiu,
    music_genres: Array.isArray(client.music_genres) ? client.music_genres : [],
    music_genre_other: client.music_genre_other || "",
    gender: client.gender || "",
  });

  // Carrega gêneros musicais do backend
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

  const handleSave = async () => {
    try {
      setLoading(true);

      await apiFetch(`/clients/${client.id}`, {
        method: "PUT",
        body: {
          name: form.name,
          email: form.email,
          city: form.city,
          phone: form.phone,
          birth_date: form.birth_date || null,
          lead_source: form.lead_source || null,
          // Backend aceita nome do evento como string e resolve o ID internamente
          favorite_event: form.favorite_event || null,
          last_event: form.last_event || null,
          bought_with_partiu: form.bought_with_partiu,
          music_genres: form.music_genres,
          music_genre_other: form.music_genre_other || null,
          gender: form.gender || null,
        },
      });

      onSaved();
    } catch (err: any) {
      alert(err?.message || "Erro ao atualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* Nome */}
      <input
        placeholder="Nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Email */}
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Cidade */}
      <input
        placeholder="Cidade"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Telefone */}
      <input
        placeholder="Telefone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Data de Aniversário */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">Data de aniversário</label>
        <input
          type="date"
          value={form.birth_date || ""}
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
        />
      </div>

      {/* Gênero */}
      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      >
        <option value="">Gênero (opcional)</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
      </select>

      {/* Origem do lead */}
      <select
        value={form.lead_source}
        onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      >
        <option value="">Origem do lead (opcional)</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Evento favorito — texto livre, backend resolve o ID */}
      <input
        placeholder="Evento favorito (opcional)"
        value={form.favorite_event}
        onChange={(e) => setForm({ ...form, favorite_event: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Último evento */}
      <input
        placeholder="Último evento que foi (opcional)"
        value={form.last_event}
        onChange={(e) => setForm({ ...form, last_event: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
      />

      {/* Comprou com PARTIU */}
      <label className="flex items-center gap-2 text-sm text-white/90">
        <input
          type="checkbox"
          checked={form.bought_with_partiu}
          onChange={(e) =>
            setForm({ ...form, bought_with_partiu: e.target.checked })
          }
        />
        Já comprou com a PARTIU?
      </label>

      {/* Gêneros musicais */}
      <div className="rounded-lg bg-black/20 border border-white/10 p-3">
        <p className="text-sm font-semibold mb-2 text-white">Gêneros musicais</p>
        <div className="flex flex-wrap gap-2">
          {genresList.map((g) => {
            const active = form.music_genres.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  active
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-transparent border-white/20 hover:bg-white/10 text-white"
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        <input
          placeholder="Outro gênero (opcional)"
          value={form.music_genre_other}
          onChange={(e) =>
            setForm({ ...form, music_genre_other: e.target.value })
          }
          className="mt-3 w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white"
        />
      </div>

      {/* Botão hidden para submit externo */}
      <button
        id="client-edit-submit"
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="hidden"
      />

      {/* Ações */}
      {!hideActions && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-sm font-semibold disabled:opacity-50 text-white"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-sm font-semibold text-white"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}