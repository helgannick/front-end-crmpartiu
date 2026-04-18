const CACHE_KEY = 'cities_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function getCachedCities(): string[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as string[];
  } catch {
    return null;
  }
}

export function setCachedCities(cities: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: cities, timestamp: Date.now() }));
  } catch {
    // localStorage cheio ou bloqueado — ignora silenciosamente
  }
}

export function clearCitiesCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
