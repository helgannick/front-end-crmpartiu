"use client";

import { useState, useRef, useEffect } from "react";
import apiFetch from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

interface Genre {
  id: string;
  name: string;
}

const currentYear = new Date().getFullYear();

export default function ClientCreateModal({ onClose, onCreated }: Props) {
  const [genresList, setGenresList] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cityValid, setCityValid] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allCitiesRef = useRef<string[]>([]);

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

  // Pré-carrega todas as cidades uma única vez
  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
        );
        const data = await res.json();
        allCitiesRef.current = data.map((m: { nome: string }) => m.nome);
      } catch (err) {
        console.error("Erro ao carregar cidades", err);
      }
    }
    loadCities();
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
  const dayNum = Number(form.birthday_day);
  const monthNum = Number(form.birthday_month);
  const yearNum = Number(form.birthday_year);

  if (form.birthday_day && (dayNum < 1 || dayNum > 31)) {
    alert("Dia inválido"); return;
  }
  if (form.birthday_month && (monthNum < 1 || monthNum > 12)) {
    alert("Mês inválido"); return;
  }
  if (form.birthday_year && (yearNum < 1900 || yearNum > currentYear)) {
    alert("Ano inválido"); return;
  }
  if (!cityValid) {
    alert("Selecione uma cidade válida da lista.");
    return;
  }

  try {
    setLoading(true);

    const dayStr = String(form.birthday_day).padStart(2, "0");
    const monthStr = String(form.birthday_month).padStart(2, "0");
    const yearStr = String(form.birthday_year);
    const birth_date =
      dayStr && monthStr && yearStr ? `${yearStr}-${monthStr}-${dayStr}` : null;

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
        birth_date,
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

  function handleDayChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setForm((prev) => ({ ...prev, birthday_day: val }));
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    setForm((prev) => ({ ...prev, birthday_month: val }));
  }

  function handleYearChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setForm((prev) => ({ ...prev, birthday_year: val }));
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, city: value }));
    setCityValid(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const query = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const filtered = allCitiesRef.current
        .filter((nome) =>
          nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(query)
        )
        .slice(0, 8);

      setCitySuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }, 150);
  }

  function selectCity(nome: string) {
    setForm((prev) => ({ ...prev, city: nome }));
    setCityValid(true);
    setCitySuggestions([]);
    setShowSuggestions(false);
  }

  function handleCityBlur() {
    setTimeout(() => {
      setShowSuggestions(false);
      if (!cityValid) {
        setForm((prev) => ({ ...prev, city: "" }));
        setCitySuggestions([]);
      }
    }, 150);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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

          {/* Cidade com autocomplete IBGE - filtro local */}
          <div className="relative">
            <input
              className={`w-full p-2 rounded-lg bg-black/30 border transition-all text-white placeholder-white/50 focus:outline-none focus:ring-2
                ${cityValid
                  ? "border-emerald-500 focus:ring-emerald-500/30"
                  : "border-white/10 focus:ring-white/30"
                }`}
              placeholder="Cidade (selecione da lista)"
              type="text"
              value={form.city}
              onChange={handleCityChange}
              onBlur={handleCityBlur}
              required
              autoComplete="off"
              aria-label="Cidade"
            />

            {form.city.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {cityValid ? "✅" : "⚠️"}
              </span>
            )}

            {showSuggestions && citySuggestions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 rounded-xl bg-gray-800 border border-white/20 shadow-xl max-h-52 overflow-y-auto">
                {citySuggestions.map((nome) => (
                  <li
                    key={nome}
                    onMouseDown={() => selectCity(nome)}
                    className="px-4 py-2 text-white text-sm cursor-pointer hover:bg-white/10 transition-all"
                  >
                    {nome}
                  </li>
                ))}
              </ul>
            )}
          </div>

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
              inputMode="numeric"
              maxLength={2}
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_day}
              onChange={handleDayChange}
            />
            <input
              placeholder="Mês"
              inputMode="numeric"
              maxLength={2}
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_month}
              onChange={handleMonthChange}
            />
            <input
              placeholder="Ano"
              inputMode="numeric"
              maxLength={4}
              className="rounded-lg bg-black/30 border border-white/10 p-2"
              value={form.birthday_year}
              onChange={handleYearChange}
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

          <div className="space-y-1">
            <p className="text-sm opacity-70">Gêneros musicais</p>
            <div className="flex flex-wrap gap-2">
              {genresList.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${form.music_genres.includes(g.id)
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