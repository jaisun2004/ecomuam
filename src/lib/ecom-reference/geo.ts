import { citiesFor } from "./platforms";
import type { RefCity } from "./workbook-data";

/**
 * State (or Emirate) each reference city sits in, so the picker can offer
 * "state first, then cities" instead of one long wall of buttons.
 */
export const CITY_STATE: Record<string, string> = {
  ahmedabad: "Gujarat",
  bengaluru: "Karnataka",
  bangalore: "Karnataka",
  delhi: "Delhi",
  "new delhi": "Delhi",
  faridabad: "Haryana",
  gurugram: "Haryana",
  gurgaon: "Haryana",
  ghaziabad: "Uttar Pradesh",
  noida: "Uttar Pradesh",
  "gbuddha nagar": "Uttar Pradesh",
  jalandhar: "Punjab",
  kolkata: "West Bengal",
  kota: "Rajasthan",
  ajmer: "Rajasthan",
  hyderabad: "Telangana",
  dubai: "Dubai",
  "abu dhabi": "Abu Dhabi",
  "al ain": "Abu Dhabi",
};

export function stateOf(city: string): string {
  const key = city.trim().toLowerCase();
  if (CITY_STATE[key]) return CITY_STATE[key];
  if (key.includes("dub")) return "Dubai";
  if (key.includes("auh") || key.includes("abu")) return "Abu Dhabi";
  const hit = Object.keys(CITY_STATE).find((k) => key.includes(k));
  return hit ? CITY_STATE[hit] : "Other";
}

export interface GeoCity extends RefCity {
  state: string;
}

export function geoCitiesFor(platform: string): GeoCity[] {
  return citiesFor(platform).map((c) => ({ ...c, state: stateOf(c.platformCity) }));
}

export function statesFor(platform: string): string[] {
  return [...new Set(geoCitiesFor(platform).map((c) => c.state))].sort();
}

export function citiesForState(platform: string, state: string): string[] {
  return geoCitiesFor(platform)
    .filter((c) => c.state === state)
    .map((c) => c.platformCity);
}
