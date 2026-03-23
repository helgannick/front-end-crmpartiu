"use client";

import { useState } from "react";
import apiFetch from "@/lib/api";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
  birth_date?: string | null;
  lead_source?: string | null;
  favorite_event?: { id: string; name: string } | string | null; // ← aqui
  last_event?: { id: string; name: string } | string | null;     // ← aqui
  bought_with_partiu?: boolean | null;
  music_genres?: string[] | null;
  music_genre_other?: string | null;
  gender?: "Masculino" | "Feminino" | string | null;
  contacted?: boolean | null;
};

// helper para extrair o nome seguro
function toLabel(value: { name: string } | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "object") return value.name;
  return value;
}
export default function ClientView({
  client,
  onEdit,
  onDeleted,
}: {
  client: Client;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const formattedBirthday = client.birth_date
    ? new Date(client.birth_date).toLocaleDateString("pt-BR")
    : null;

  const genresLabel = (() => {
    const genres = Array.isArray(client.music_genres)
      ? client.music_genres
      : [];
    const other = (client.music_genre_other || "").trim();
    const merged = [...genres, ...(other ? [other] : [])]
      .map((s) => String(s).trim())
      .filter(Boolean);
    return merged.length ? merged.join(", ") : null;
  })();

  {typeof client.contacted === "boolean" && (
  <p>{client.contacted ? "✅ Contactado" : "⬜ Não contactado"}</p>
)}

  async function handleDelete() {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir "${client.name}"?\nEssa ação não pode ser desfeita.`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await apiFetch(`/clients/${client.id}`, { method: "DELETE" });
      onDeleted();
    } catch (err: any) {
      alert(err?.message || "Erro ao excluir cliente");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">{client.name}</h2>

      <div className="space-y-2 text-sm opacity-90">
        <p>
          🎂 {formattedBirthday || "-"}
        </p>

        {client.email && <p>📧 {client.email}</p>}
        {client.city && <p>📍 {client.city}</p>}
        {client.phone && <p>📱 {client.phone}</p>}

        {client.gender && <p>🧍 Gênero: {client.gender}</p>}
        {client.lead_source && <p>🧲 Origem: {client.lead_source}</p>}
        {toLabel(client.favorite_event) && (
          <p>⭐ Evento favorito: {toLabel(client.favorite_event)}</p>
        )}
        {toLabel(client.last_event) && (
          <p>🎫 Último evento: {toLabel(client.last_event)}</p>
        )}
        {typeof client.bought_with_partiu === "boolean" && (
          <p>
            ✅ Já comprou com a PARTIU:{" "}
            {client.bought_with_partiu ? "SIM" : "NÃO"}
          </p>
        )}

        {genresLabel && <p>🎵 Gêneros: {genresLabel}</p>}

        <p>📞 Status: {client.contacted ? "✅ Contactado" : "⬜ Não contactado"}</p>
      </div>

      <div className="flex gap-3 mt-6">
        {client.phone && (
          <a
            href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
            target="_blank"
            className="flex-1 text-center rounded-lg bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold transition"
          >
            WhatsApp
          </a>
        )}

        {client.email && (
          <a
            href={`mailto:${client.email}`}
            className="flex-1 text-center rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold transition"
          >
            Email
          </a>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 px-4 py-2 text-sm font-semibold transition"
        >
          Editar dados
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 rounded-lg bg-red-600/80 hover:bg-red-600 px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </>
  );
}