"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { normalizeClients, type InvalidRow, type NormalizedClient } from "@/lib/normalizeClients";
import apiFetch from "@/lib/api";

type Props = {
  onClose: () => void;
  onImported?: () => void;
};

type ImportResult = {
  created: number;
  skipped: number;
};

export default function ImportClientsModal({ onClose, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [valid, setValid] = useState<NormalizedClient[]>([]);
  const [invalid, setInvalid] = useState<InvalidRow[]>([]);
  const [showInvalid, setShowInvalid] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          defval: "",
          raw: false,
        });

        const normalized = normalizeClients(rows);
        setValid(normalized.valid);
        setInvalid(normalized.invalid);
      } catch {
        setError("Erro ao ler o arquivo. Verifique se é um .xlsx, .xls ou .csv válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    if (valid.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const data: ImportResult = await apiFetch("/clients/bulk", {
        method: "POST",
        body: { clients: valid },
      });
      setResult(data);
      onImported?.();
    } catch (err: any) {
      setError(err.message || "Erro ao importar clientes");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setValid([]);
    setInvalid([]);
    setFileName("");
    setResult(null);
    setError(null);
    setShowInvalid(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-gray-900 border border-white/10 shadow-xl p-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white"
          aria-label="Fechar"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-5">Importar planilha</h2>

        {/* Resultado final */}
        {result ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-5xl">✅</div>
            <p className="text-xl font-semibold">Importação concluída!</p>
            <div className="grid grid-cols-2 gap-4 w-full mt-2">
              <div className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{result.created}</p>
                <p className="text-sm text-white/60 mt-1">criados</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <p className="text-3xl font-bold text-white/50">{result.skipped}</p>
                <p className="text-sm text-white/60 mt-1">ignorados</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={reset}
                className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 font-semibold text-sm"
              >
                Nova importação
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 py-2 font-semibold text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Área de upload */}
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <p className="text-white/50 text-sm">
                {fileName
                  ? `📄 ${fileName}`
                  : "Clique ou arraste um arquivo .xlsx, .xls ou .csv"}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {/* Preview após leitura */}
            {(valid.length > 0 || invalid.length > 0) && (
              <div className="mt-5 space-y-4">
                {/* Contagem de válidos */}
                <div className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-white/70">Clientes válidos</span>
                  <span className="text-emerald-400 font-bold text-lg">{valid.length}</span>
                </div>

                {/* Rejeitados */}
                {invalid.length > 0 && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <button
                      className="w-full flex items-center justify-between text-sm text-red-400"
                      onClick={() => setShowInvalid((v) => !v)}
                    >
                      <span>{invalid.length} registro{invalid.length !== 1 ? "s" : ""} rejeitado{invalid.length !== 1 ? "s" : ""}</span>
                      <span>{showInvalid ? "▲" : "▼"}</span>
                    </button>

                    {showInvalid && (
                      <ul className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {invalid.map((item, i) => {
                          const label =
                            item.row["nome"] ||
                            item.row["name"] ||
                            item.row["email"] ||
                            `Linha ${i + 1}`;
                          return (
                            <li key={i} className="text-xs text-white/60 border-t border-white/5 pt-2">
                              <span className="text-white/80">{String(label)}</span>
                              {" — "}
                              <span className="text-red-400">{item.reason}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Erro */}
            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            {/* Ações */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleImport}
                disabled={valid.length === 0 || loading}
                className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 py-2 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Enviando..."
                  : valid.length > 0
                  ? `Cadastrar ${valid.length} cliente${valid.length !== 1 ? "s" : ""}`
                  : "Cadastrar clientes"}
              </button>

              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-white/10 hover:bg-white/20 py-2 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
