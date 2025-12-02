"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import apiFetch from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    apiFetch("/clients", { token: getToken() }).then((res) => {
      setClients(res.data || res);
    });
  }, []);

  return (
    <Protected>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>

        <ul className="space-y-2">
          {clients.map((c: any) => (
            <li key={c.id} className="border p-3 rounded">
              <Link
                href={`/clients/${c.id}`}
                className="text-blue-600 underline"
              >
                {c.name} — {c.email}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Protected>
  );
}
