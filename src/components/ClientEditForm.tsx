"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;

  birthday_day?: number;
  birthday_month?: number;
  birthday_year?: number;

  lead_source?: string | null;
  favorite_event?: string | null;
  last_event?: string | null;
  bought_with_partiu?: boolean | null;
  music_genres?: string[] | null;
  music_genre_other?: string | null;
  gender?: "Masculino" | "Feminino" | string | null;
};

const GENRE_OPTIONS = ["pagode", "funk", "samba", "sertanejo", "e-music", "axé"] as const;

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
  const [form, setForm] = useState({
    name: client.name || "",
    email: client.email || "",
    city: client.city || "",
    phone: client.phone || "",

    birthday_day: client.birthday_day ? String(client.birthday_day) : "",
    birthday_month: client.birthday_month ? String(client.birthday_month) : "",
    birthday_year: client.birthday_year ? String(client.birthday_year) : "",

    lead_source: client.lead_source || "",
    favorite_event: client.favorite_event || "",
    last_event: client.last_event || "",
    bought_with_partiu: !!client.bought_with_partiu,

    music_genres: Array.isArray(client.music_genres) ? client.music_genres : [],
    music_genre_other: client.music_genre_other || "",

    gender: client.gender || "",
  });

  const [loading, setLoading] = useState(false);

  function toggleGenre(genre: string) {
    setForm((prev) => {
      const has = prev.music_genres.includes(genre);
      return {
        ...prev,
        music_genres: has ? prev.music_genres.filter((g) => g !== genre) : [...prev.music_genres, genre],
      };
    });
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

          birthday_day: form.birthday_day ? Number(form.birthday_day) : null,
          birthday_month: form.birthday_month ? Number(form.birthday_month) : null,
          birthday_year: form.birthday_year ? Number(form.birthday_year) : null,

          lead_source: form.lead_source || null,
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

      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="Dia"
          value={form.birthday_day}
          onChange={(e) => setForm({ ...form, birthday_day: e.target.value })}
          className="rounded-lg bg-black/30 border border-white/10 p-2"
          inputMode="numeric"
        />
        <input
          placeholder="Mês"
          value={form.birthday_month}
          onChange={(e) => setForm({ ...form, birthday_month: e.target.value })}
          className="rounded-lg bg-black/30 border border-white/10 p-2"
          inputMode="numeric"
        />
        <input
          placeholder="Ano"
          value={form.birthday_year}
          onChange={(e) => setForm({ ...form, birthday_year: e.target.value })}
          className="rounded-lg bg-black/30 border border-white/10 p-2"
          inputMode="numeric"
        />
      </div>

      <select
        value={form.gender}
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
      >
        <option value="">Gênero (opcional)</option>
        <option value="Masculino">Masculino</option>
        <option value="Feminino">Feminino</option>
      </select>

      <input
        placeholder="Origem do lead"
        value={form.lead_source}
        onChange={(e) => setForm({ ...form, lead_source: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
      />

      <input
        placeholder="Evento favorito"
        value={form.favorite_event}
        onChange={(e) => setForm({ ...form, favorite_event: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
      />

      <input
        placeholder="Último evento que foi"
        value={form.last_event}
        onChange={(e) => setForm({ ...form, last_event: e.target.value })}
        className="w-full rounded-lg bg-black/30 border border-white/10 p-2"
      />

      <label className="flex items-center gap-2 text-sm text-white/90">
        <input
          type="checkbox"
          checked={form.bought_with_partiu}
          onChange={(e) => setForm({ ...form, bought_with_partiu: e.target.checked })}
        />
        Já comprou com a PARTIU?
      </label>

      <div className="rounded-lg bg-black/20 border border-white/10 p-3">
        <p className="text-sm font-semibold mb-2">Gênero musical favorito</p>

        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((g) => {
            const active = form.music_genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  active ? "bg-white/20 border-white/30" : "bg-transparent border-white/10 hover:bg-white/10"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        <input
          placeholder="Outros (opcional)"
          value={form.music_genre_other}
          onChange={(e) => setForm({ ...form, music_genre_other: e.target.value })}
          className="mt-3 w-full rounded-lg bg-black/30 border border-white/10 p-2"
        />
      </div>

      {/* botão invisível pra modal acionar */}
      <button
        id="client-edit-submit"
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="hidden"
      />

      {!hideActions && (
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
      )}
    </div>
  );
}
