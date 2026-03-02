export type BirthdayClient = {
  id: string;
  name: string;
  email?: string;
  city?: string;
  phone?: string;
  birth_date: string; // ← obrigatório, sem ?
};

export type Client = {
  id: string;
  name: string;
  email?: string;
  birth_date?: string;
};