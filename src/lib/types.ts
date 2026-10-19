// أنواع البيانات الأساسية لمشروع "جدول منصات"

export type PlatformType = "رماه" | "ثكنة" | "خطين" | "-رماه" | "-ثكنة";

export const PLATFORM_TYPES: PlatformType[] = ["رماه", "ثكنة", "خطين", "-رماه", "-ثكنة"];

export type SealCategory = "الثكنه" | "الرماه" | "العادية" | "النادره";

export const SEAL_CATEGORIES: SealCategory[] = ["الثكنه", "الرماه", "العادية", "النادره"];

export type CardTier = "sss" | "ss";

/** ختم داخل إحدى الخانات الست */
export interface SealSlot {
  sealId: string | null;
  level: string;
}

/** اختام المنصة: 6 خانات دائرة */
export type SealsSlots = SealSlot[];

/** بطاقة تمتلكها المنصة: النجومية والمستوي يختلفان من منصة لأخرى */
export interface CardAssignment {
  stars: number;
  level: string;
}

export interface Readiness {
  freeHours: number; // ساعات حره
  healHours: number; // ساعات العلاج
  speed50: number; // تساريع مسيره 50%
  speed25: number; // تساريع مسيره 25%
}

export interface Gold {
  barracks: number; // مذهب الثكنه (مليون)
  archers: number; // مذهب الرماه (مليون)
}

export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
  legionPower: number; // قوة الفيلق
  mard: number; // مارد
  seals: SealsSlots; // 6 خانات
  cards: Record<string, CardAssignment>; // key = بطاقة تمتلكها المنصة
  readiness: Readiness;
  gold: Gold;
  castlePlayer: string; // لاعب القلعه
  notes: string;
}

export interface Seal {
  id: string;
  name: string;
  category: SealCategory;
}

export interface Card {
  id: string;
  name: string;
  tier: CardTier;
  classification: string;
  maxStars: number;
}

export interface RegistrationLink {
  id: string;
  label: string;
  active: boolean;
  createdAt: number;
}

export interface Registration {
  id: string;
  linkId: string;
  platformId: string;
  playerName: string;
  createdAt: number;
}

export type CollectionName = "platforms" | "seals" | "cards" | "links" | "registrations";

export function emptySeals(): SealsSlots {
  return Array.from({ length: 6 }, () => ({ sealId: null, level: "" }));
}

export function emptyReadiness(): Readiness {
  return { freeHours: 0, healHours: 0, speed50: 0, speed25: 0 };
}

export function emptyGold(): Gold {
  return { barracks: 0, archers: 0 };
}
