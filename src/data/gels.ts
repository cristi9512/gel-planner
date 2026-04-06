import type { GelEntry } from '../types';
import rawGels from './gels.json';

export const GEL_DATABASE: GelEntry[] = rawGels as GelEntry[];

export const GEL_BRANDS: string[] = [...new Set(GEL_DATABASE.map((g) => g.brand))].sort();

export function getGelById(id: string): GelEntry | undefined {
  return GEL_DATABASE.find((g) => g.id === id);
}
