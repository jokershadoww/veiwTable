// طبقة التخزين الموحدة (Realtime Database):
// - إذا كانت مفاتيح Firebase موجودة => اشتراك لحظي مع Realtime Database
// - وإلا => وضع تجريبي في الذاكرة حتى تربط المشروع (يعمل بنفس الواجهة تماماً)
"use client";

import { useCallback, useEffect, useState } from "react";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";
import { firebaseReady, getDb } from "./firebase";
import {
  type Card,
  type CollectionName,
  type Platform,
  type Registration,
  type RegistrationLink,
  type Seal,
  emptyGold,
  emptyReadiness,
  emptySeals,
} from "./types";
import { DEMO_CARDS, DEMO_PLATFORMS, DEMO_SEALS } from "./demoData";

/* ------------------------------ المخزن التجريبي ------------------------------ */

interface DemoState {
  platforms: Platform[];
  seals: Seal[];
  cards: Card[];
  links: RegistrationLink[];
  registrations: Registration[];
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function createState(): DemoState {
  return {
    platforms: DEMO_PLATFORMS.map((p) => ({ ...p })),
    seals: DEMO_SEALS.map((s) => ({ ...s })),
    cards: DEMO_CARDS.map((c) => ({ ...c })),
    links: [
      { id: "demo-link-1", label: "دفعة الأسبوع الأول", active: true, createdAt: Date.now() },
    ],
    registrations: [],
  };
}

let demoState: DemoState = createState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribeDemo(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** إعادة ضبط الوضع التجريبي */
export function resetDemo() {
  demoState = createState();
  emit();
}

const sameId = (item: unknown, id: string) => (item as { id?: string }).id === id;

function withCol(col: CollectionName, fn: (list: unknown[]) => unknown[]) {
  const key = col as keyof DemoState;
  demoState = { ...demoState, [key]: fn(demoState[key] as unknown[]) } as DemoState;
  emit();
}

/* ------------------------------ مسارات القاعدة ------------------------------ */

const path = (col: CollectionName, id?: string) => (id ? `${col}/${id}` : col);

/* --------------------------------- العمليات --------------------------------- */

async function addRecord(col: CollectionName, data: Record<string, unknown>): Promise<string> {
  if (firebaseReady) {
    const node = push(ref(getDb(), path(col)));
    await set(node, data);
    return node.key as string;
  }
  const id = uid();
  withCol(col, (list) => [...list, { id, ...data }]);
  return id;
}

async function updateRecord(col: CollectionName, id: string, data: Record<string, unknown>) {
  if (firebaseReady) {
    await update(ref(getDb(), path(col, id)), data);
    return;
  }
  withCol(col, (list) =>
    list.map((it) => (sameId(it, id) ? { ...(it as Record<string, unknown>), ...data } : it))
  );
}

async function removeRecord(col: CollectionName, id: string) {
  if (firebaseReady) {
    await remove(ref(getDb(), path(col, id)));
    return;
  }
  withCol(col, (list) => list.filter((it) => !sameId(it, id)));
}

/** حفظ عنصر (إضافة أو تعديل حسب وجود id) */
export async function saveRecord(
  col: CollectionName,
  data: Record<string, unknown> & { id?: string }
) {
  if (data.id) {
    const { id, ...rest } = data;
    await updateRecord(col, id, rest);
    return id;
  }
  return addRecord(col, data);
}

export async function deleteRecord(col: CollectionName, id: string) {
  await removeRecord(col, id);
}

/** قراءة كل التسجيلات من القاعدة */
async function readRegistrations(): Promise<Registration[]> {
  const snap = await get(ref(getDb(), "registrations"));
  const value = (snap.val() ?? {}) as Record<string, Omit<Registration, "id">>;
  return Object.entries(value).map(([id, row]) => ({ id, ...row }));
}

/** إفراغ اللاعبين المسجّلين عبر رابط معين من منصاتهم */
async function resetPlayersFor(platformIds: string[]) {
  const ids = platformIds.filter(Boolean);
  if (firebaseReady) {
    await Promise.all(
      ids.map((platformId) =>
        update(ref(getDb(), path("platforms", platformId)), { castlePlayer: "" })
      )
    );
    return;
  }
  withCol("platforms", (list) =>
    list.map((p) =>
      ids.includes((p as Platform).id) ? { ...(p as Platform), castlePlayer: "" } : p
    )
  );
}

/** حذف رابط مع كل تسجيلاته */
export async function deleteLinkWithRegistrations(linkId: string) {
  if (firebaseReady) {
    const rows = await readRegistrations();
    const mine = rows.filter((r) => r.linkId === linkId);
    await Promise.all(mine.map((r) => remove(ref(getDb(), path("registrations", r.id)))));
    await remove(ref(getDb(), path("links", linkId)));
    await resetPlayersFor(mine.map((r) => r.platformId));
    return;
  }
  const mine = demoState.registrations.filter((r) => r.linkId === linkId);
  withCol("registrations", (list) =>
    list.filter((r) => (r as Registration).linkId !== linkId)
  );
  withCol("links", (list) => list.filter((l) => (l as RegistrationLink).id !== linkId));
  await resetPlayersFor(mine.map((r) => r.platformId));
}

/** مسح كل تسجيلات رابط معين (يبقى الرابط) */
export async function clearLinkRegistrations(linkId: string) {
  if (firebaseReady) {
    const rows = (await readRegistrations()).filter((r) => r.linkId === linkId);
    await Promise.all(rows.map((r) => remove(ref(getDb(), path("registrations", r.id)))));
    await resetPlayersFor(rows.map((r) => r.platformId));
    return;
  }
  const mine = demoState.registrations.filter((r) => r.linkId === linkId);
  withCol("registrations", (list) =>
    list.filter((r) => (r as Registration).linkId !== linkId)
  );
  await resetPlayersFor(mine.map((r) => r.platformId));
}

/** تسجيل لاعب في منصة عبر رابط (لاعب واحد لكل منصة في الرابط) */
export async function registerPlayer(
  linkId: string,
  platformId: string,
  playerName: string
): Promise<{ ok: boolean; error?: string }> {
  const name = playerName.trim();
  if (!name) return { ok: false, error: "اكتب اسم اللاعب" };

  const link = demoState.links.find((l) => l.id === linkId);
  if (link && !link.active) return { ok: false, error: "هذا الرابط موقوف مؤقتاً" };

  const id = `${linkId}__${platformId}`;

  if (firebaseReady) {
    const [linkSnap, takenSnap] = await Promise.all([
      get(ref(getDb(), path("links", linkId))),
      get(ref(getDb(), path("registrations", id))),
    ]);
    const linkData = linkSnap.val() as { active?: boolean } | null;
    if (linkData && linkData.active === false)
      return { ok: false, error: "هذا الرابط موقوف مؤقتاً" };
    if (takenSnap.exists()) return { ok: false, error: "هذه المنصة تم تسجيل لاعب فيها بالفعل" };
  } else if (demoState.registrations.some((r) => r.linkId === linkId && r.platformId === platformId)) {
    return { ok: false, error: "هذه المنصة تم تسجيل لاعب فيها بالفعل" };
  }

  await saveRecord("registrations", {
    id,
    linkId,
    platformId,
    playerName: name,
    createdAt: Date.now(),
  });
  await updateRecord("platforms", platformId, { castlePlayer: name });
  return { ok: true };
}

/* ---------------------------------- الهوك ---------------------------------- */

const colKey = (col: CollectionName): keyof DemoState => col as keyof DemoState;

/** ترتيب الصفوف: المنصات تنازلياً حسب أعلى قوة فيلق، والباقي حسب الأحدث/الاسم */
function sortRows<T>(col: CollectionName, list: T[]): T[] {
  const rows = [...list] as Record<string, unknown>[];
  // ترتيب المنصات تنازلياً حسب أعلى قوة فيلق
  if (col === "platforms") rows.sort((a, b) => Number(b.legionPower) - Number(a.legionPower));
  if (col === "links" || col === "registrations")
    rows.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  if (col === "seals" || col === "cards")
    rows.sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
  return rows as unknown as T[];
}

/** اشتراك لحظي بمجموعة كاملة */
export function useRecords<T extends { id: string }>(col: CollectionName): {
  records: T[];
  loading: boolean;
  error: boolean;
} {
  const readDemo = useCallback(
    () => sortRows(col, demoState[colKey(col)] as unknown as T[]),
    [col]
  );

  // في الوضع التجريبي تبدأ الحالة من المخزن مباشرة (بدون setState داخل الأثر)
  const [records, setRecords] = useState<T[]>(() => (firebaseReady ? [] : readDemo()));
  const [loading, setLoading] = useState(firebaseReady);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!firebaseReady) {
      return subscribeDemo(() => setRecords(readDemo()));
    }

    const node = ref(getDb(), path(col));
    const unsub = onValue(
      node,
      (snap) => {
        const value = (snap.val() ?? {}) as Record<string, Omit<T, "id">>;
        const rows = Object.entries(value).map(([id, row]) => ({ id, ...row })) as T[];
        setRecords(sortRows(col, rows));
        setLoading(false);
        setError(false);
      },
      () => {
        setLoading(false);
        setError(true);
      }
    );
    return unsub;
  }, [col, readDemo]);

  return { records, loading, error };
}

/** تهيئة قيم افتراضية للحقول القديمة / تحويل صيغة RTDB */
export function normalizePlatform(raw: Record<string, unknown>): Platform {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    type: (raw.type as Platform["type"]) ?? "رماه",
    legionPower: Number(raw.legionPower ?? 0),
    mard: Number(raw.mard ?? 0),
    seals: normalizeSeals(raw.seals),
    cards: normalizeCardMap(raw.cards),
    readiness: { ...emptyReadiness(), ...((raw.readiness as object) ?? {}) },
    gold: { ...emptyGold(), ...((raw.gold as object) ?? {}) },
    castlePlayer: String(raw.castlePlayer ?? ""),
    notes: String(raw.notes ?? ""),
  };
}

/** تُحوِّل 6 خانات الاختام مهما كانت صيغتها (مصفوفة أو كائن رقمي من RTDB) */
function normalizeSeals(value: unknown): Platform["seals"] {  const base = emptySeals();
  if (Array.isArray(value)) {
    value.slice(0, 6).forEach((slot, i) => {
      const s = (slot ?? {}) as { sealId?: string | null; level?: string };
      base[i] = {
        sealId: s.sealId ? String(s.sealId) : null,
        level: String(s.level ?? ""),
      };
    });
    return base;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, slot]) => {
      const i = Number(key);
      if (!Number.isInteger(i) || i < 0 || i > 5) return;
      const s = (slot ?? {}) as { sealId?: string | null; level?: string };
      base[i] = {
        sealId: s.sealId ? String(s.sealId) : null,
        level: String(s.level ?? ""),
      };
    });
  }
  return base;
}

/** بطايق المنصة الممتلكة: { [بطاقة]: { نجومية, مستوي } } — تدعم الصيغ القديمة */
function normalizeCardMap(value: unknown): Platform["cards"] {
  const map: Platform["cards"] = {};
  if (Array.isArray(value)) {
    // صيغة قديمة: مصفوفة معرفات بدون نجومية/مستوي
    value.forEach((id) => {
      if (typeof id === "string" && id) map[id] = { stars: 0, level: "" };
    });
    return map;
  }
  if (value && typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([id, v]) => {
      if (v && typeof v === "object") {
        const a = v as { stars?: number; level?: string };
        map[id] = { stars: Number(a.stars ?? 0), level: String(a.level ?? "") };
      } else if (v === true) {
        map[id] = { stars: 0, level: "" };
      }
    });
  }
  return map;
}
