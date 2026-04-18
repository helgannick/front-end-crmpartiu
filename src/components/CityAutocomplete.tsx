"use client";

interface Props {
  value: string; valid: boolean;
  suggestions: string[]; showSuggestions: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void; onSelect: (nome: string) => void;
  cacheSource?: 'static' | 'cache' | 'api' | null;
  onRefreshCache?: () => void;
}

const SOURCE_LABEL: Record<string, string> = {
  static: 'lista local',
  cache:  'cache',
  api:    'IBGE',
};

export function CityAutocomplete({ value, valid, suggestions, showSuggestions, onChange, onBlur, onSelect, cacheSource, onRefreshCache }: Props) {
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
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {cacheSource && (
          <span className="text-xs text-white/40 bg-white/10 px-1.5 py-0.5 rounded-full">
            {SOURCE_LABEL[cacheSource]}
          </span>
        )}
        {value.length > 0 && (
          <span className="text-sm">{valid ? "✅" : "⚠️"}</span>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-xl bg-[#0a0a23] border border-white/20 shadow-xl max-h-52 overflow-y-auto">
          {suggestions.map((nome) => (
            <li key={nome} onMouseDown={() => onSelect(nome)}
              className="px-4 py-2 text-white text-sm cursor-pointer hover:bg-white/10 transition-all">
              {nome}
            </li>
          ))}
          {onRefreshCache && cacheSource === 'cache' && (
            <li className="px-4 py-2 border-t border-white/10">
              <button type="button" onMouseDown={onRefreshCache}
                className="text-xs text-white/40 hover:text-white/70 transition-colors">
                Atualizar lista
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
