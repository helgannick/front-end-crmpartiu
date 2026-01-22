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
};

type ClientModalProps = {
  client: Client | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function ClientModal({
  client,
  onClose,
  onUpdated,
}: ClientModalProps) {
  const [editing, setEditing] = useState(false);

  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-gray-900
        border border-white/10 shadow-xl p-6 text-white"
      >
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
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              onUpdated?.();
              onClose();
            }}
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
