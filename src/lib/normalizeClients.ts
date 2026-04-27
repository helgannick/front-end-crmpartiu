type RawRow = Record<string, any>;

export interface NormalizedClient {
  name: string;
  email: string;
  phone: string;
  city?: string;
  gender?: "Masculino" | "Feminino";
  instagram?: string;
  birth_date?: string;
  lead_source?: string;
  bought_with_partiu: boolean;
}

export interface InvalidRow {
  row: RawRow;
  reason: string;
}

export interface NormalizeResult {
  valid: NormalizedClient[];
  invalid: InvalidRow[];
}

// Retorna o valor da primeira chave encontrada (case-insensitive)
function pick(row: RawRow, ...keys: string[]): string {
  for (const key of keys) {
    const found = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === key.toLowerCase()
    );
    if (found !== undefined && row[found] !== undefined && row[found] !== null) {
      return String(row[found]).trim();
    }
  }
  return "";
}

function normalizeGender(raw: string): "Masculino" | "Feminino" | null {
  const v = raw.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (["m", "masc", "masculino", "male", "man", "homem"].includes(v)) return "Masculino";
  if (["f", "fem", "feminino", "female", "woman", "mulher"].includes(v)) return "Feminino";
  return null;
}

function normalizeBirthDate(row: RawRow): string | null {
  // Tenta coluna única: data_nascimento, birth_date, nascimento, data, birthday, aniversario, aniversário
  const singleCol = pick(
    row,
    "data_nascimento", "birth_date", "nascimento", "data", "birthday",
    "aniversario", "aniversário", "data de nascimento", "birthdate"
  );

  if (singleCol) {
    // Pode ser objeto Date serializado pelo SheetJS
    // Tenta formato DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const iso = parseDate(singleCol);
    if (iso) return iso;
  }

  // Colunas separadas
  const day = pick(row, "dia", "day", "dia_nascimento", "birth_day");
  const month = pick(row, "mes", "mês", "month", "mes_nascimento", "birth_month");
  const year = pick(row, "ano", "year", "ano_nascimento", "birth_year");

  if (day && month && year) {
    const d = String(day).padStart(2, "0");
    const m = String(month).padStart(2, "0");
    const y = String(year);
    // Valida
    const parsed = parseDate(`${d}/${m}/${y}`);
    if (parsed) return parsed;
  }

  return null;
}

function parseDate(raw: string): string | null {
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return raw;
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const date = new Date(iso);
    if (!isNaN(date.getTime())) return iso;
  }
  // Número serial do Excel (dias desde 1900-01-01)
  const serial = Number(raw);
  if (!isNaN(serial) && serial > 1000 && serial < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeBool(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  return ["sim", "yes", "true", "1", "s", "y"].includes(v);
}

export function normalizeClients(rows: RawRow[]): NormalizeResult {
  const valid: NormalizedClient[] = [];
  const invalid: InvalidRow[] = [];

  for (const row of rows) {
    const name = pick(row, "nome", "name", "cliente", "client", "full_name", "nome_completo");
    if (!name) {
      invalid.push({ row, reason: "Nome obrigatório" });
      continue;
    }

    const email = pick(row, "email", "e-mail", "e_mail", "email_address");
    if (!email) {
      invalid.push({ row, reason: "Email obrigatório" });
      continue;
    }
    if (!isValidEmail(email)) {
      invalid.push({ row, reason: `Email inválido: "${email}"` });
      continue;
    }

    const phone = pick(
      row,
      "telefone", "phone", "whatsapp", "celular", "tel", "fone",
      "phone_number", "numero", "número"
    );
    if (!phone) {
      invalid.push({ row, reason: "Telefone obrigatório" });
      continue;
    }

    const rawGender = pick(row, "genero", "gênero", "gender", "sexo");
    const gender = rawGender ? normalizeGender(rawGender) : undefined;

    const birth_date = normalizeBirthDate(row) ?? undefined;

    if (birth_date && birth_date > new Date().toISOString().split('T')[0]) {
      invalid.push({ row, reason: `Data de nascimento no futuro: "${birth_date}"` });
      continue;
    }

    const rawBought = pick(
      row,
      "comprou_partiu", "bought_with_partiu", "comprou", "partiu", "comprou_com_partiu"
    );
    const bought_with_partiu = rawBought ? normalizeBool(rawBought) : false;

    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(cleanPhone)) {
      invalid.push({ row, reason: `Telefone inválido: "${phone}" (precisa ter 10 ou 11 dígitos)` });
      continue;
    }

    const city = pick(row, "cidade", "city", "municipio", "município") || undefined;
    const instagram = pick(row, "instagram", "insta", "ig") || undefined;
    const lead_source = pick(row, "origem", "lead_source", "fonte", "source") || undefined;

    valid.push({
      name,
      email,
      phone: cleanPhone,
      ...(city && { city }),
      ...(gender && { gender }),
      ...(instagram && { instagram }),
      ...(birth_date && { birth_date }),
      ...(lead_source && { lead_source }),
      bought_with_partiu,
    });
  }

  return { valid, invalid };
}
