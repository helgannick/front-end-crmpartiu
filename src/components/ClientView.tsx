"use client";

type Client = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
  birthday_day: number;
  birthday_month: number;
  birthday_year: number;
};

export default function ClientView({
  client,
  onEdit,
}: {
  client: Client;
  onEdit: () => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">{client.name}</h2>

      <div className="space-y-2 text-sm opacity-90">
        <p>🎂 {client.birthday_day}/{client.birthday_month}/{client.birthday_year}</p>
        {client.email && <p>📧 {client.email}</p>}
        {client.city && <p>📍 {client.city}</p>}
        {client.phone && <p>📱 {client.phone}</p>}
      </div>

      <div className="flex gap-3 mt-6">
        {client.phone && (
          <a
            href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
            target="_blank"
            className="flex-1 text-center rounded-lg bg-emerald-500/80
            hover:bg-emerald-500 px-4 py-2 text-sm font-semibold transition"
          >
            WhatsApp
          </a>
        )}

        {client.email && (
          <a
            href={`mailto:${client.email}`}
            className="flex-1 text-center rounded-lg bg-white/10
            hover:bg-white/20 px-4 py-2 text-sm font-semibold transition"
          >
            Email
          </a>
        )}
      </div>

      <button
        onClick={onEdit}
        className="mt-4 w-full rounded-lg bg-blue-600/80
        hover:bg-blue-600 px-4 py-2 text-sm font-semibold transition"
      >
        Editar dados
      </button>
    </>
  );
}
