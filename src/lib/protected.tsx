"use client";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children }: any) {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) router.push("/auth/login");
  }, [token]);

  if (!token) return <div>Carregando...</div>;

  return children;
}
