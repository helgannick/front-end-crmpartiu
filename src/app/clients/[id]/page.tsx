"use client";

import { useEffect, useState } from "react";
import Protected from "@/lib/protected";
import { getToken } from "@/lib/auth";
import apiFetch from "@/lib/api";

export default function ClientDetail({ params }: any) {
  const id = params.id;

  const [client, setClient] = useState<any>(null);
  const [interactions, setInteractions] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    apiFetch(`/clients/${id}`, { token: getToken() }).then(setClient);
    apiFetch(`/clients/${id}/interactions`, { token: getToken() }).then(
      (res) => setInteractions(res || [])
    );
  }, []);

  async function addInteraction(e: any) {
    e.preventDefault();
    await apiFetch(`/clients/${id}/interactions`, {
      method: "POST",
      token: getToken(),
      body: { note },
    });

    setNote("");
    const it = await apiFetch(`/clients/${id}/interactions`, {
      token: getToken(),
    });
    setInteractions(it || []);
  }

  return (
    <Protected>
      <div className="p-6">
        {client && (
          <>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p>{client.email}</p>
          </>
        )}

        <h2 className="text-xl mt-6">Interações</h2>

        <ul>
          {interactions.map((i: any) => (
            <li key={i.id} className="border-b py-2">
              {i.note}
            </li>
          ))}
        </ul>

        <form onSubmit={addInteraction} className="mt-4">
          <textarea
            className="border w-full p-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="bg-green-600 text-white p-2 mt-2 rounded">
            Adicionar interação
          </button>
        </form>
      </div>
    </Protected>
  );
}
