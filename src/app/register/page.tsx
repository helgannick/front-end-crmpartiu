"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const INSTAGRAM_URL = "https://www.instagram.com/partiupraboa/"; // <- coloque seu perfil aqui



export default function PublicRegister(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [birthdayDay, setBirthdayDay] = useState<string>("");
  const [birthdayMonth, setBirthdayMonth] = useState<string>("");
  const [instagramHandle, setInstagramHandle] = useState<string>("");
  const [birthdayYear, setBirthdayYear] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [birth, setBirth] = useState("");

  function handleBirthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // 🔥 se está apagando → não refazer formatação
    if (value.length < birth.length) {
      setBirth(value);
      setBirthdayDay(numbers.slice(0, 2));
      setBirthdayMonth(numbers.slice(2, 4));
      setBirthdayYear(numbers.slice(4, 8));
      return;
    }

    // limite máximo: 8 números (DD MM AAAA)
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

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
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
    // Remove tudo que não é número
    let value = e.target.value.replace(/\D/g, "");

    // Limita a 11 dígitos (DDD + número)
    if (value.length > 11) value = value.slice(0, 11);

    setPhone(value);
  }

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const normalized = validateAndNormalizeDate();
    if (!normalized) return;

    setLoading(true);
    try {
      await apiFetch("/public/register", {
        method: "POST",
        body: {
          name,
          email,
          city,
          phone,
          birthday_day: normalized.day,
          birthday_month: normalized.month,
          birthday_year: normalized.year,
          Instagram: instagramHandle ? [instagramHandle] : [],
        },
      });

      setName("");
      setEmail("");
      setCity("");
      setPhone("");
      setBirthdayDay("");
      setBirthdayMonth("");
      setBirthdayYear("");
      setBirth("");
      setInstagramHandle("");

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
                  Cadastro realizado 🎉
                </h3>
                <p className="text-center text-sm text-gray-700">
                  Obrigado! Quer receber novidades por lá? Segue a gente no
                  Instagram.
                </p>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-white/40 to-white/10 border border-white/10 shadow hover:opacity-95 text-black font-medium"
                >
                  Seguir no Instagram
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
                placeholder="Aniversário(DD/MM/AA)"
                maxLength={10}
                inputMode="numeric"
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                required
              />

              <input
                className="w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="Cidade"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                aria-label="Cidade"
              />

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
                placeholder="Whatsapp (DD + número)"
                inputMode="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                aria-label="Whatsapp"
              />

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
