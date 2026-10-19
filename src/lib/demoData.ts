// بيانات تجريبية تظهر قبل ربط Firebase — لمعاينة التصميم وتجربة كل شيء
import type { Card, Platform, Seal } from "./types";

export const DEMO_SEALS: Seal[] = [
  { id: "s1", name: "ختم الفيلق الذهبي", category: "الثكنه" },
  { id: "s2", name: "ختم الحرب", category: "الثكنه" },
  { id: "s3", name: "ختم الدرع", category: "الرماه" },
  { id: "s4", name: "ختم النبل", category: "الرماه" },
  { id: "s5", name: "ختم السرعة", category: "العادية" },
  { id: "s6", name: "ختم القوة", category: "العادية" },
  { id: "s7", name: "ختم التاج", category: "النادره" },
  { id: "s8", name: "ختم الأسطورة", category: "النادره" },
];

export const DEMO_CARDS: Card[] = [
  { id: "c1", name: "بطاقة المغير", tier: "sss", classification: "هجومية", maxStars: 6 },
  { id: "c2", name: "بطاقة الحامية", tier: "sss", classification: "دفاعية", maxStars: 6 },
  { id: "c3", name: "بطاقة السرعة", tier: "ss", classification: "سير", maxStars: 5 },
  { id: "c4", name: "بطاقة الدعم", tier: "ss", classification: "مساعدة", maxStars: 5 },
];

const P = (i: number, over: Partial<Platform>): Platform => ({
  id: `demo-${i}`,
  name: `منصة ${i}`,
  type: "رماه",
  legionPower: 0,
  mard: 0,
  seals: Array.from({ length: 6 }, () => ({ sealId: null, level: "" })),
  cards: {},
  readiness: { freeHours: 0, healHours: 0, speed50: 0, speed25: 0 },
  gold: { barracks: 0, archers: 0 },
  castlePlayer: "",
  notes: "",
  ...over,
});

export const DEMO_PLATFORMS: Platform[] = [
  P(1, { type: "رماه", legionPower: 125000, mard: 40, castlePlayer: "أحمد", notes: "منصة رئيسية" }),
  P(2, { type: "ثكنة", legionPower: 98000, mard: 32, castlePlayer: "سالم" }),
  P(3, { type: "خطين", legionPower: 210000, mard: 55 }),
  P(4, { type: "-رماه", legionPower: 76000, mard: 28, castlePlayer: "خالد" }),
  P(5, { type: "-ثكنة", legionPower: 64000, mard: 21 }),
  P(6, { type: "رماه", legionPower: 143000, mard: 46, castlePlayer: "يوسف" }),
  P(7, { type: "ثكنة", legionPower: 87000, mard: 30 }),
  P(8, { type: "خطين", legionPower: 190000, mard: 51, notes: "تحت التجهيز" }),
];
