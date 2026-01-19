"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);
      console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);


      if (error) throw error;
      if (!data.session) throw new Error("Sessão não criada");

      // 👉 salva token (usado pelo backend)
      setToken(data.session.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),rgba(0,0,0,0.8))] p-4">
      <div className="flex flex-col items-center w-full max-w-md">

        <Image
          src="/Logo-Partiu-Pra-Boa-foguete.svg"
          alt="Logo"
          width={120}
          height={120}
          className="mb-6 opacity-90 drop-shadow-lg"
        />

        <form
          onSubmit={login}
          className="
            backdrop-blur-xl bg-white/10 
            p-8 w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)]
            border border-white/20
          "
        >
          <h1 className="text-2xl font-semibold text-center text-white mb-6">
            Entrar na conta
          </h1>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                bg-white/10 border border-white/20 
                p-3 rounded-xl text-white placeholder-white/60
                focus:outline-none focus:ring-2 focus:ring-blue-400/50
              "
              required
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                bg-white/10 border border-white/20 
                p-3 rounded-xl text-white placeholder-white/60
                focus:outline-none focus:ring-2 focus:ring-blue-400/50
              "
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="
                bg-gradient-to-r from-blue-500 to-blue-700
                text-white p-3 rounded-xl font-semibold
                hover:opacity-90 transition active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Carregando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
