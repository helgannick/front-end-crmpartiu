"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login(e: any) {
    e.preventDefault();
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(res.token);
      router.push("/clients");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={login} className="p-6 border rounded w-96">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}
