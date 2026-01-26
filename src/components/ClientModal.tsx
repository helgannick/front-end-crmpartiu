"use client";

import { useState } from "react";
import ClientView from "./ClientView";
import ClientEditForm from "./ClientEditForm";

export type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;

  birthday_day?: number;
  birthday_month?: number;
  birthday_year?: number;

  lead_source?: string | null;
  favorite_event?: string | null;
  last_event?: string | null;
  bought_with_partiu?: boolean | null;
  music_genres?: string[] | null;
  music_genre_other?: string | null;
  gender?: "Masculino" | "Feminino" | string | null;
};

type ClientModalProps = {
  client: Client | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function ClientModal({ client, onClose, onUpdated }: ClientModalProps) {
  const [editing, setEditing] = useState(false);

  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative z-10 w-full max-w-md
          rounded-2xl bg-gray-900 border border-white/10 shadow-xl text-white
          max-h-[90vh] flex flex-col overflow-hidden
        "
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b border-white/10">
          <h3 className="text-lg font-semibold">
            {editing ? "Editar cliente" : "Detalhes do cliente"}
          </h3>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/60 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="px-6 py-4 overflow-y-auto">
          {!editing ? (
            <ClientView
              client={client}
              onEdit={() => setEditing(true)}
              onDeleted={() => {
                onUpdated?.();
                onClose();
              }}
            />
          ) : (
            <ClientEditForm
              client={client}
              // ✅ agora os botões ficam no footer, então:
              hideActions
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                onUpdated?.();
                onClose();
              }}
            />
          )}
        </div>

        {/* Footer (sticky) */}
        {editing && (
          <div className="px-6 py-4 border-t border-white/10 bg-gray-900">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-sm font-semibold"
              >
                Cancelar
              </button>

              {/* dispara o submit interno do form */}
              <button
                type="button"
                onClick={() => {
                  const btn = document.getElementById("client-edit-submit") as HTMLButtonElement | null;
                  btn?.click();
                }}
                className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-sm font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
