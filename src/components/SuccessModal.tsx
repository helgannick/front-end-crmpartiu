"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_URL = "https://chat.whatsapp.com/JwQgbVJuz3k1H95Rz4yxcC";

interface Props { show: boolean; onClose: () => void; }

export function SuccessModal({ show, onClose }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div key="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative z-50 w-[90%] sm:max-w-md bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col items-center"
            role="dialog" aria-modal="true">
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="rounded-full bg-white/30 p-2">
                <Image src="/Logo-Partiu-Pra-Boa-foguete.svg" alt="logo" width={96} height={96} priority />
              </div>
              <h3 className="text-lg font-semibold text-center">🎉 Cadastro realizado</h3>
              <p className="text-center text-sm text-gray-700">
                🎖️ Agora você pode fazer parte do grupo EXCLUSIVO de COMPRA & VENDAS da Partiu.<br />Obrigado!
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center px-4 py-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-lg shadow-lg transition-all">
                Entrar no Grupo!
              </a>
              <button className="mt-3 text-sm underline text-gray-800" onClick={onClose}>Fechar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}