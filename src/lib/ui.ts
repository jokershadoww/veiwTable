import type { PlatformType } from "./types";

export const TYPE_STYLES: Record<PlatformType, string> = {
  "رماه": "bg-sky-500/18 text-sky-300 ring-sky-400/35",
  "ثكنة": "bg-violet-500/18 text-violet-300 ring-violet-400/35",
  "خطين": "bg-emerald-500/18 text-emerald-300 ring-emerald-400/35",
  "-رماه": "bg-sky-500/10 text-sky-400/80 ring-sky-400/25",
  "-ثكنة": "bg-violet-500/10 text-violet-400/80 ring-violet-400/25",
};

export function formatNum(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US");
}
