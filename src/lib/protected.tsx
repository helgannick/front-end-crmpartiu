"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) router.push("/auth/login");
        else setChecking(false);
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  if (checking) return null;

  return <>{children}</>;
}
