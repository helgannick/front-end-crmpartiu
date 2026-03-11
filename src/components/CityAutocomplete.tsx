"use client";

interface Props {
  value: string; valid: boolean;
  suggestions: string[]; showSuggestions: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void; onSelect: (nome: string) => void;
}

export function CityAutocomplete({ value, valid, suggestions, showSuggestions, onChange, onBlur, onSelect }: Props) {
  return (
    <div className="relative">
      <input
        className={`w-full p-3 rounded-xl bg-white/10 border backdrop-blur-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all ${
          valid ? "border-emerald-500 focus:ring-emerald-500/30" : "border-white/20 focus:ring-white/30"
        }`}
        placeholder="Cidade (selecione da lista)"
        type="text" value={value} onChange={onChange} onBlur={onBlur}
        required autoComplete="off" aria-label="Cidade"
      />
      {value.length > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">{valid ? "✅" : "⚠️"}</span>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-xl bg-[#0a0a23] border border-white/20 shadow-xl max-h-52 overflow-y-auto">
          {suggestions.map((nome) => (
            <li key={nome} onMouseDown={() => onSelect(nome)}
              className="px-4 py-2 text-white text-sm cursor-pointer hover:bg-white/10 transition-all">
              {nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}