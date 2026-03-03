"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const INSTAGRAM_URL = "https://chat.whatsapp.com/JwQgbVJuz3k1H95Rz4yxcC";

interface Genre {
  id: string;
  name: string;
}

const currentYear = new Date().getFullYear();

export default function PublicRegister(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [cityValid, setCityValid] = useState<boolean>(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allCitiesRef = useRef<string[]>([]);

  const [phone, setPhone] = useState<string>("");
  const [birthdayDay, setBirthdayDay] = useState<string>("");
  const [birthdayMonth, setBirthdayMonth] = useState<string>("");
  const [birthdayYear, setBirthdayYear] = useState<string>("");
  const [birth, setBirth] = useState("");
  const [instagramHandle, setInstagramHandle] = useState<string>("");
  const [leadSource, setLeadSource] = useState<string>("");
  const [favoriteEvent, setFavoriteEvent] = useState<string>("");
  const [lastEvent, setLastEvent] = useState<string>("");
  const [boughtWithPartiu, setBoughtWithPartiu] = useState<string>("NAO");
  const [gender, setGender] = useState<string>("");
  const [musicGenres, setMusicGenres] = useState<string[]>([]);
  const [musicGenreOther, setMusicGenreOther] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [genresList, setGenresList] = useState<Genre[]>([]);

  // Carrega gêneros musicais
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

  // Pré-carrega todas as cidades do IBGE uma única vez
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

  const boughtBoolean = useMemo(
    () => boughtWithPartiu === "SIM",
    [boughtWithPartiu]
  );

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    if (!cityValid) {
      setErrorMessage("Selecione uma cidade válida da lista.");
      return;
    }

    const normalized = validateAndNormalizeDate();
    if (!normalized) return;

    const birthDate = `${normalized.year}-${normalized.month}-${normalized.day}`;

    setLoading(true);
    try {
      await apiFetch("/public/register", {
        method: "POST",
        body: {
          name,
          email,
          city,
          phone,
          birth_date: birthDate,
          Instagram: instagramHandle ? [instagramHandle] : [],
          lead_source: leadSource || null,
          favorite_event: favoriteEvent || null,
          last_event: lastEvent || null,
          bought_with_partiu: boughtBoolean,
          music_genres: musicGenres,
          music_genre_other: musicGenreOther || null,
          gender: gender || null,
        },
      });

      // reset campos
      setName("");
      setEmail("");
      setCity("");
      setCityValid(false);
      setPhone("");
      setBirthdayDay("");
      setBirthdayMonth("");
      setBirthdayYear("");
      setBirth("");
      setInstagramHandle("");
      setLeadSource("");
      setFavoriteEvent("");
      setLastEvent("");
      setBoughtWithPartiu("NAO");
      setGender("");
      setMusicGenres([]);
      setMusicGenreOther("");
      setShowModal(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Ocorreu um erro ao cadastrar.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  function handleBirthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");

    if (value.length < birth.length) {
      setBirth(value);
      setBirthdayDay(numbers.slice(0, 2));
      setBirthdayMonth(numbers.slice(2, 4));
      setBirthdayYear(numbers.slice(4, 8));
      return;
    }

    const limited = numbers.slice(0, 8);
    const day = limited.slice(0, 2);
    const month = limited.slice(2, 4);
    const year = limited.slice(4, 8);

    let formatted = day;
    if (month) formatted = `${day}/${month}`;
    if (year) formatted = `${day}/${month}/${year}`;

    setBirth(formatted);
    setBirthdayDay(day);
    setBirthdayMonth(month);
    setBirthdayYear(year);
  }

  function validateAndNormalizeDate() {
    if (!birthdayDay || !birthdayMonth || !birthdayYear) {
      setErrorMessage("Informe dia, mês e ano do aniversário.");
      return null;
    }

    const dayNum = Number(birthdayDay);
    const monthNum = Number(birthdayMonth);
    const yearNum = Number(birthdayYear);

    if (dayNum < 1 || dayNum > 31) {
      setErrorMessage("Dia inválido. Use valores entre 01 e 31.");
      return null;
    }
    if (monthNum < 1 || monthNum > 12) {
      setErrorMessage("Mês inválido. Use valores entre 01 e 12.");
      return null;
    }
    if (yearNum < 1900 || yearNum > currentYear) {
      setErrorMessage("Ano inválido.");
      return null;
    }

    return {
      day: String(dayNum).padStart(2, "0"),
      month: String(monthNum).padStart(2, "0"),
      year: String(yearNum),
    };
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    setPhone(value);
  }

  function toggleGenre(id: string) {
    setMusicGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCity(value);
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
    setCity(nome);
    setCityValid(true);
    setCitySuggestions([]);
    setShowSuggestions(false);
  }

  function handleCityBlur() {
    setTimeout(() => {
      setShowSuggestions(false);
      if (!cityValid) {
        setCity("");
        setCitySuggestions([]);
      }
    }, 150);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050517] via-[#070723] to-[#0a0a23] p-6">
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modalBackdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
              aria-hidden
            />
            <motion.div
              key="modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="relative z-50 w-[90%] sm:max-w-md bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 overflow-auto max-h-[90vh] flex flex-col items-center"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="rounded-full bg-white/30 p-2">
                  <Image
                    src="/Logo-Partiu-Pra-Boa-foguete.svg"
                    alt="logo"
                    width={96}
                    height={96}
                    priority
                  />
                </div>

                <h3 className="text-lg font-semibold text-center">
                  🎉 Cadastro realizado
                </h3>
                <p className="text-center text-sm text-gray-700">
                  🎖️ Agora você pode fazer parte do grupo EXCLUSIVO de COMPRA &
                  VENDAS da Partiu.
                  <br />
                  Obrigado!
                </p>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center px-4 py-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Entrar no Grupo!
                </a>

                <button
                  className="mt-3 text-sm underline text-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        onSubmit={register}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-lg p-8 rounded-3xl bg-white/6 backdrop-blur-md border border-white/10 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, stiffness: 140 }}
              className="rounded-full p-1 bg-white/20"
            >
              <Image
                src="/Logo-Partiu-Pra-Boa-foguete.svg"
                alt="logo"
                width={120}
                height={120}
                priority
                className="block"
              />
            </motion.div>

            <div className="text-white text-center md:text-left">
              <h1 className="text-2xl font-semibold">Cadastro</h1>
              <p className="mt-1 text-sm text-white/80 max-w-xs">
                Receba novidades e promoções. Seu aniversário vira motivo de
                surpresa!
              </p>
            </div>
          </div>

          <div className="flex-1 w-full">
            {errorMessage && (
              <div className="mb-3 text-sm text-red-300 bg-red-900/30 p-2 rounded">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Como devo te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Nome"
              />

              <input
                type="text"
                value={birth}
                onChange={handleBirthChange}
                placeholder="Aniversário (DD/MM/AAAA)"
                maxLength={10}
                inputMode="numeric"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                required
              />

              {/* Cidade com autocomplete IBGE */}
              <div className="relative">
                <input
                  className={`w-full p-3 rounded-xl bg-white/10 border backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all
                    ${cityValid
                      ? "border-emerald-500 focus:ring-emerald-500/30"
                      : "border-white/20 focus:ring-white/30"
                    }`}
                  placeholder="Cidade (selecione da lista)"
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  onBlur={handleCityBlur}
                  required
                  autoComplete="off"
                  aria-label="Cidade"
                />

                {city.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                    {cityValid ? "✅" : "⚠️"}
                  </span>
                )}

                {showSuggestions && citySuggestions.length > 0 && (
                  <ul className="absolute z-50 w-full mt-1 rounded-xl bg-[#0a0a23] border border-white/20 shadow-xl max-h-52 overflow-y-auto">
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
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email"
              />

              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Whatsapp"
                inputMode="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                aria-label="Whatsapp"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                >
                  <option value="" className="bg-[#0a0a23]">Gênero</option>
                  <option value="Masculino" className="bg-[#0a0a23]">Masculino</option>
                  <option value="Feminino" className="bg-[#0a0a23]">Feminino</option>
                </select>

                <select
                  value={boughtWithPartiu}
                  onChange={(e) => setBoughtWithPartiu(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                >
                  <option value="NAO" className="bg-[#0a0a23]">Já comprou com a PARTIU?</option>
                  <option value="SIM" className="bg-[#0a0a23]">Sim</option>
                  <option value="NAO" className="bg-[#0a0a23]">Não</option>
                </select>
              </div>

              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Evento favorito"
                value={favoriteEvent}
                onChange={(e) => setFavoriteEvent(e.target.value)}
                aria-label="Evento favorito"
              />

              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Último evento que foi"
                value={lastEvent}
                onChange={(e) => setLastEvent(e.target.value)}
                aria-label="Último evento"
              />

              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-white/70 mb-2">Gêneros musicais</p>
                <div className="flex flex-wrap gap-2">
                  {genresList.map((g) => {
                    const active = musicGenres.includes(g.id);
                    return (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => toggleGenre(g.id)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${active
                            ? "bg-white text-black border-white font-semibold"
                            : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                          }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>

                <input
                  className="mt-3 w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="Outros"
                  value={musicGenreOther}
                  onChange={(e) => setMusicGenreOther(e.target.value)}
                  aria-label="Outros gêneros"
                />
              </div>

              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Instagram (opcional)"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                aria-label="Instagram"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full p-3 rounded-xl bg-white/40 text-black font-medium shadow-md disabled:opacity-60"
                aria-busy={loading}
              >
                {loading ? "Enviando..." : "Cadastrar"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}