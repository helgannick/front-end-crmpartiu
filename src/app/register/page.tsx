"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePublicRegister } from "@/hooks/usePublicRegister";
import { SuccessModal } from "@/components/SuccessModal";
import { CityAutocomplete } from "@/components/CityAutocomplete";

const INPUT = "w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all";
const SELECT = "w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all";

export default function PublicRegister() {
  const f = usePublicRegister();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050517] via-[#070723] to-[#0a0a23] p-6">
      <SuccessModal show={f.showModal} onClose={() => f.setShowModal(false)} />

      <motion.form onSubmit={f.register} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-lg p-8 rounded-3xl bg-white/6 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 items-center">

          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 }} className="rounded-full p-1 bg-white/20">
              <Image src="/Logo-Partiu-Pra-Boa-foguete.svg" alt="logo" width={120} height={120} priority />
            </motion.div>
            <div className="text-white text-center md:text-left">
              <h1 className="text-2xl font-semibold">Cadastro</h1>
              <p className="mt-1 text-sm text-white/80 max-w-xs">
                Receba novidades e promoções. Seu aniversário vira motivo de surpresa!
              </p>
            </div>
          </div>

          <div className="flex-1 w-full">
            {f.errorMessage && (
              <div className="mb-3 text-sm text-red-300 bg-red-900/30 p-2 rounded">{f.errorMessage}</div>
            )}
            <div className="grid grid-cols-1 gap-3">
              <input className={INPUT} placeholder="Como devo te chamar?" value={f.name}
                onChange={(e) => f.setName(e.target.value)} required aria-label="Nome" />

              <input className={INPUT} type="text" value={f.birth} onChange={f.handleBirthChange}
                placeholder="Aniversário (DD/MM/AAAA)" maxLength={10} inputMode="numeric" required />

              <CityAutocomplete value={f.city} valid={f.cityValid} suggestions={f.citySuggestions}
                showSuggestions={f.showSuggestions} onChange={f.handleCityChange}
                onBlur={f.handleCityBlur} onSelect={f.selectCity} />

              <input className={INPUT} placeholder="E-mail" type="email" value={f.email}
                onChange={(e) => f.setEmail(e.target.value)} required aria-label="Email" />

              <input className={INPUT} placeholder="Whatsapp" inputMode="tel" value={f.phone}
                onChange={f.handlePhoneChange} required aria-label="Whatsapp" />

              <div className="grid grid-cols-2 gap-3">
                <select className={SELECT} value={f.gender} onChange={(e) => f.setGender(e.target.value)}>
                  <option value="" className="bg-[#0a0a23]">Gênero</option>
                  <option value="Masculino" className="bg-[#0a0a23]">Masculino</option>
                  <option value="Feminino" className="bg-[#0a0a23]">Feminino</option>
                </select>
                <select className={SELECT} value={f.boughtWithPartiu} onChange={(e) => f.setBoughtWithPartiu(e.target.value)}>
                  <option value="NAO" className="bg-[#0a0a23]">Já comprou com a PARTIU?</option>
                  <option value="SIM" className="bg-[#0a0a23]">Sim</option>
                  <option value="NAO" className="bg-[#0a0a23]">Não</option>
                </select>
              </div>

              <input className={INPUT} placeholder="Evento favorito" value={f.favoriteEvent}
                onChange={(e) => f.setFavoriteEvent(e.target.value)} />

              <input className={INPUT} placeholder="Último evento que foi" value={f.lastEvent}
                onChange={(e) => f.setLastEvent(e.target.value)} />

              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-white/70 mb-2">Gêneros musicais</p>
                <div className="flex flex-wrap gap-2">
                  {f.genresList.map((g) => {
                    const active = f.musicGenres.includes(g.id);
                    return (
                      <button type="button" key={g.id} onClick={() => f.toggleGenre(g.id)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          active ? "bg-white text-black border-white font-semibold" : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                        }`}>
                        {g.name}
                      </button>
                    );
                  })}
                </div>
                <input className="mt-3 w-full p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  placeholder="Outros" value={f.musicGenreOther} onChange={(e) => f.setMusicGenreOther(e.target.value)} />
              </div>

              <input className={INPUT} placeholder="Instagram (opcional)" value={f.instagramHandle}
                onChange={(e) => f.setInstagramHandle(e.target.value)} />

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                disabled={f.loading} className="w-full p-3 rounded-xl bg-white/40 text-black font-medium shadow-md disabled:opacity-60">
                {f.loading ? "Enviando..." : "Cadastrar"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}