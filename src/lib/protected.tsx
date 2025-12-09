"use client";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token, router]);

  if (!token) return <div>Carregando...</div>;

  return children;
}
