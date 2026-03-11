import { useMemo, useRef, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Genre { id: string; name: string; }
const currentYear = new Date().getFullYear();

export function usePublicRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [cityValid, setCityValid] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allCitiesRef = useRef<string[]>([]);
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [birthdayDay, setBirthdayDay] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState("");
  const [birthdayYear, setBirthdayYear] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [favoriteEvent, setFavoriteEvent] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [boughtWithPartiu, setBoughtWithPartiu] = useState("NAO");
  const [gender, setGender] = useState("");
  const [musicGenres, setMusicGenres] = useState<string[]>([]);
  const [musicGenreOther, setMusicGenreOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const KNOWN_GENRES: Genre[] = [
  { id: "eletr", name: "Eletrônico" },
  { id: "funk",  name: "Funk" },
  { id: "pagod", name: "Pagode" },
  { id: "serta", name: "Sertanejo" },
  { id: "trap",  name: "Trap" },
];
const [genresList, setGenresList] = useState<Genre[]>(KNOWN_GENRES);

useEffect(() => {
  apiFetch("/music-genres")
    .then((data) => { if (data?.length) setGenresList(data); })
    .catch(console.error);
}, []);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
      .then((r) => r.json())
      .then((data) => { allCitiesRef.current = data.map((m: { nome: string }) => m.nome); })
      .catch(console.error);
  }, []);

  const boughtBoolean = useMemo(() => boughtWithPartiu === "SIM", [boughtWithPartiu]);

  function resetForm() {
    setName(""); setEmail(""); setCity(""); setCityValid(false);
    setPhone(""); setBirth(""); setBirthdayDay(""); setBirthdayMonth("");
    setBirthdayYear(""); setInstagramHandle(""); setLeadSource("");
    setFavoriteEvent(""); setLastEvent(""); setBoughtWithPartiu("NAO");
    setGender(""); setMusicGenres([]); setMusicGenreOther("");
  }

  function validateAndNormalizeDate() {
    if (!birthdayDay || !birthdayMonth || !birthdayYear) {
      setErrorMessage("Informe dia, mês e ano do aniversário."); return null;
    }
    const d = Number(birthdayDay), m = Number(birthdayMonth), y = Number(birthdayYear);
    if (d < 1 || d > 31) { setErrorMessage("Dia inválido."); return null; }
    if (m < 1 || m > 12) { setErrorMessage("Mês inválido."); return null; }
    if (y < 1900 || y > currentYear) { setErrorMessage("Ano inválido."); return null; }
    return {
      day: String(d).padStart(2, "0"),
      month: String(m).padStart(2, "0"),
      year: String(y),
    };
  }

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    if (!cityValid) { setErrorMessage("Selecione uma cidade válida da lista."); return; }
    const normalized = validateAndNormalizeDate();
    if (!normalized) return;
    setLoading(true);
    try {
      await apiFetch("/public/register", {
        method: "POST",
        body: {
          name, email, city, phone,
          birth_date: `${normalized.year}-${normalized.month}-${normalized.day}`,
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
      resetForm();
      setShowModal(true);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err
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
      setBirth(value); setBirthdayDay(numbers.slice(0, 2));
      setBirthdayMonth(numbers.slice(2, 4)); setBirthdayYear(numbers.slice(4, 8));
      return;
    }
    const limited = numbers.slice(0, 8);
    const day = limited.slice(0, 2), month = limited.slice(2, 4), year = limited.slice(4, 8);
    let formatted = day;
    if (month) formatted = `${day}/${month}`;
    if (year) formatted = `${day}/${month}/${year}`;
    setBirth(formatted); setBirthdayDay(day); setBirthdayMonth(month); setBirthdayYear(year);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    setPhone(value);
  }

  function toggleGenre(id: string) {
    setMusicGenres((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCity(value); setCityValid(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setCitySuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(() => {
      const query = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = allCitiesRef.current
        .filter((nome) => nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query))
        .slice(0, 8);
      setCitySuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }, 150);
  }

  function selectCity(nome: string) {
    setCity(nome); setCityValid(true); setCitySuggestions([]); setShowSuggestions(false);
  }

  function handleCityBlur() {
    setTimeout(() => {
      setShowSuggestions(false);
      if (!cityValid) { setCity(""); setCitySuggestions([]); }
    }, 150);
  }

  return {
    name, setName, email, setEmail,
    city, cityValid, citySuggestions, showSuggestions,
    phone, birth, gender, setGender,
    boughtWithPartiu, setBoughtWithPartiu,
    favoriteEvent, setFavoriteEvent, lastEvent, setLastEvent,
    leadSource, setLeadSource, instagramHandle, setInstagramHandle,
    musicGenres, musicGenreOther, setMusicGenreOther,
    genresList, loading, showModal, setShowModal, errorMessage,
    register, handleBirthChange, handlePhoneChange,
    toggleGenre, handleCityChange, selectCity, handleCityBlur,
  };
}