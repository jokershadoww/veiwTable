"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, Layers } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  PLATFORM_TYPES,
  emptyGold,
  emptyReadiness,
  emptySeals,
  type Card,
  type Platform,
  type PlatformType,
} from "@/lib/types";
import { deleteRecord, normalizePlatform, saveRecord, useRecords } from "@/lib/store";
import { TYPE_STYLES, formatNum } from "@/lib/ui";

interface FormState {
  id?: string;
  name: string;
  type: PlatformType;
  legionPower: number;
  mard: number;
  castlePlayer: string;
  notes: string;
  readiness: ReturnType<typeof emptyReadiness>;
  gold: ReturnType<typeof emptyGold>;
  seals: { sealId: string | null; level: string }[];
  cards: Record<string, { stars: number; level: string }>; // البطايق الممتلكة + نجوميتها ومستواها
}

const blank = (): FormState => ({
  name: "",
  type: "رماه",
  legionPower: 0,
  mard: 0,
  castlePlayer: "",
  notes: "",
  readiness: emptyReadiness(),
  gold: emptyGold(),
  seals: emptySeals(),
  cards: {},
});

const SEAL_COLORS = ["#f7c948", "#38bdf8", "#a78bfa", "#34d399", "#f472b6", "#fb923c"];

export default function PlatformsManager() {
  const { records: raw } = useRecords<Platform>("platforms");
  const { records: seals } = useRecords("seals");
  const { records: cards } = useRecords<Card>("cards");

  const platforms = useMemo(
    () => (raw as unknown[]).map((r) => normalizePlatform(r as Record<string, unknown>)),
    [raw]
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => blank());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const rows = platforms.filter(
    (p) => !search.trim() || p.name.includes(search.trim()) || p.castlePlayer.includes(search.trim())
  );

  function openAdd() {
    setForm(blank());
    setOpen(true);
  }

  function openEdit(p: Platform) {
    setForm({
      id: p.id,
      name: p.name,
      type: p.type,
      legionPower: p.legionPower,
      mard: p.mard,
      castlePlayer: p.castlePlayer,
      notes: p.notes,
      readiness: p.readiness,
      gold: p.gold,
      seals: p.seals.map((s) => ({ ...s })),
      cards: JSON.parse(JSON.stringify(p.cards ?? {})),
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // منع تكرار نفس الختم في أكثر من خانة لنفس المنصة (يحذف التكرار ويُبقي الأول)
      const seen = new Set<string>();
      const seals = form.seals.map((s) => {
        if (!s.sealId) return s;
        if (seen.has(s.sealId)) return { sealId: null, level: "" };
        seen.add(s.sealId);
        return s;
      });
      await saveRecord("platforms", {
        ...form,
        seals,
      } as unknown as Record<string, unknown>);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(p: Platform) {
    if (!confirm(`حذف المنصة "${p.name}"؟ لا يمكن التراجع.`)) return;
    await deleteRecord("platforms", p.id);
  }

  /** تبديل امتلاك بطاقة: الضغط يضيفها (نجومية 0 + مستوي فارغ) ثم تظهر خاناتها */
  function toggleCard(cardId: string) {
    setForm((f) => {
      const cards = { ...f.cards };
      if (cards[cardId]) {
        delete cards[cardId];
      } else {
        cards[cardId] = { stars: 0, level: "" };
      }
      return { ...f, cards };
    });
  }

  const groupedSeals = ["الثكنه", "الرماه", "العادية", "النادره"].map((cat) => ({
    cat,
    list: (seals as { id: string; name: string; category: string }[]).filter(
      (s) => s.category === cat
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              <Layers size={16} />
            </span>
            إدارة المنصات
          </h2>
          <p className="mt-1 text-xs text-slate-400">{platforms.length} منصة مسجّلة</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pr-9"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary shrink-0" onClick={openAdd}>
            <Plus size={16} />
            إضافة منصة
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">
          لا توجد منصات — اضغط «إضافة منصة» لبدء الجدول.
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>اسم المنصه</th>
                <th>النوع</th>
                <th>قوة الفيلق</th>
                <th>مارد</th>
                <th>لاعب القلعه</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="font-extrabold text-white">{p.name}</td>
                  <td>
                    <span className={`chip ring-1 ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                  </td>
                  <td className="tabular-nums text-slate-200">{formatNum(p.legionPower)}</td>
                  <td className="tabular-nums text-gold-400">{formatNum(p.mard)}</td>
                  <td className="text-slate-300">{p.castlePlayer || "—"}</td>
                  <td>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        className="icon-btn h-8 w-8 text-gold-400"
                        title="تعديل"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn h-8 w-8 text-rose-300"
                        title="حذف"
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نموذج إضافة/تعديل منصة */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? `تعديل ${form.name}` : "إضافة منصة جديدة"}
        subtitle="املأ بيانات المنصة — الاختام والبطايق والجاهزية والمذهب كلها هنا"
        icon={<Layers size={19} />}
        size="xl"
      >
        <form onSubmit={onSubmit} className="space-y-6">
          {/* بيانات أساسية */}
          <section className="space-y-3">
            <h4 className="text-xs font-black text-gold-400">البيانات الأساسية</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="label">اسم المنصه</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: منصة 1"
                  required
                />
              </div>
              <div>
                <label className="label">نوع المنصه</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as PlatformType })}
                >
                  {PLATFORM_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0b1020]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">قوة الفيلق</label>
                <input
                  type="number"
                  className="input"
                  value={form.legionPower}
                  onChange={(e) => setForm({ ...form, legionPower: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div>
                <label className="label">مارد (عدد)</label>
                <input
                  type="number"
                  className="input"
                  value={form.mard}
                  onChange={(e) => setForm({ ...form, mard: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div>
                <label className="label">لاعب القلعه (يُترك فارغاً للمنصات المتاحة)</label>
                <input
                  className="input"
                  value={form.castlePlayer}
                  onChange={(e) => setForm({ ...form, castlePlayer: e.target.value })}
                  placeholder="اسم اللاعب"
                />
              </div>
            </div>
            <div>
              <label className="label">ملاحظات</label>
              <textarea
                className="input min-h-20 resize-y"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي ملاحظات على المنصة..."
              />
            </div>
          </section>

          {/* الجاهزية */}
          <section className="space-y-3">
            <h4 className="text-xs font-black text-emerald-300">الجاهزية</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["freeHours", "عدد ساعات حره"],
                  ["healHours", "عدد ساعات العلاج"],
                  ["speed50", "تساريع مسيره 50%"],
                  ["speed25", "تساريع مسيره 25%"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    value={form.readiness[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        readiness: { ...form.readiness, [key]: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </section>

          {/* المذهب */}
          <section className="space-y-3">
            <h4 className="text-xs font-black text-amber-300">المذهب (بالمليون)</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">عدد مذهب الثكنه</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={form.gold.barracks}
                  onChange={(e) =>
                    setForm({ ...form, gold: { ...form.gold, barracks: Number(e.target.value) } })
                  }
                />
              </div>
              <div>
                <label className="label">عدد مذهب الرماه</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={form.gold.archers}
                  onChange={(e) =>
                    setForm({ ...form, gold: { ...form.gold, archers: Number(e.target.value) } })
                  }
                />
              </div>
            </div>
          </section>

          {/* الاختام */}
          <section className="space-y-3">
            <h4 className="text-xs font-black text-gold-400">الاختام — 6 خانات (المستوي يُكتب يدوياً)</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.seals.map((slot, i) => {
                // الأختام المستخدمة في باقي الخانات لا يمكن اختيارها مرة أخرى هنا
                const usedElsewhere = new Set(
                  form.seals
                    .filter((s, si) => si !== i && s.sealId)
                    .map((s) => s.sealId as string)
                );
                const groups = groupedSeals
                  .map((g) => ({ ...g, list: g.list.filter((s) => !usedElsewhere.has(s.id)) }))
                  .filter((g) => g.list.length > 0);
                return (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="chip ring-1 ring-white/15"
                      style={{ background: `${SEAL_COLORS[i]}22`, color: SEAL_COLORS[i] }}
                    >
                      خانة {i + 1}
                    </span>
                    {slot.sealId && (
                      <button
                        type="button"
                        className="text-[11px] font-bold text-rose-300 hover:text-rose-200"
                        onClick={() =>
                          setForm({
                            ...form,
                            seals: form.seals.map((s, si) =>
                              si === i ? { sealId: null, level: "" } : s
                            ),
                          })
                        }
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <select
                    className="input"
                    value={slot.sealId ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        seals: form.seals.map((s, si) =>
                          si === i ? { ...s, sealId: e.target.value || null } : s
                        ),
                      })
                    }
                  >
                    <option value="" className="bg-[#0b1020]">
                      — بدون ختم —
                    </option>
                    {groups.map((g) => (
                      <optgroup key={g.cat} label={g.cat} className="bg-[#0b1020]">
                        {g.list.map((s) => (
                          <option key={s.id} value={s.id} className="bg-[#0b1020]">
                            {s.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <input
                    className="input mt-2"
                    placeholder="مستوي الختم (يدوي)..."
                    value={slot.level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        seals: form.seals.map((s, si) =>
                          si === i ? { ...s, level: e.target.value } : s
                        ),
                      })
                    }
                  />
                </div>
                );
              })}
            </div>
          </section>

          {/* البطايق */}
          <section className="space-y-3">
            <h4 className="text-xs font-black text-sky-300">
              البطايق — اضغط «تمتلكها» على البطاقة لتظهر خانات النجومية والمستوي لهذه المنصة
            </h4>
            {cards.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 p-4 text-xs text-slate-400">
                لا توجد بطايق بعد — أضفها من تبويب «البطايق» أولاً.
              </p>
            ) : (
              <div className="space-y-3">
                {(["sss", "ss"] as const).map((tier) => {
                  const list = (cards as Card[]).filter((c) => c.tier === tier);
                  if (!list.length) return null;
                  return (
                    <div key={tier}>
                      <p className="mb-2 text-[11px] font-black uppercase text-slate-400">
                        بطايق {tier}
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {list.map((card) => {
                          const value = form.cards[card.id];
                          const owned = Boolean(value);
                          return (
                            <div
                              key={card.id}
                              className="rounded-xl border border-white/10 bg-black/25 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                                    card.tier === "sss"
                                      ? "bg-amber-400/20 text-amber-300"
                                      : "bg-sky-400/20 text-sky-300"
                                  }`}
                                >
                                  {tier.toUpperCase()}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-extrabold text-white">
                                    {card.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {card.classification} · أقصى {card.maxStars} نجوم
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleCard(card.id)}
                                  aria-pressed={owned}
                                  className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${
                                    owned
                                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                                      : "bg-white/[0.06] text-slate-400 ring-1 ring-white/10 hover:text-white"
                                  }`}
                                >
                                  {owned ? "تمتلكها" : "لا تمتلكها"}
                                </button>
                              </div>

                              {owned && value && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400">
                                      النجومية
                                    </span>
                                    <select
                                      className="input w-20 px-2 py-1.5 text-xs"
                                      value={value.stars}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          cards: {
                                            ...f.cards,
                                            [card.id]: {
                                              ...value,
                                              stars: Number(e.target.value),
                                            },
                                          },
                                        }))
                                      }
                                    >
                                      {Array.from(
                                        { length: card.maxStars + 1 },
                                        (_, n) => (
                                          <option
                                            key={n}
                                            value={n}
                                            className="bg-[#0b1020]"
                                          >
                                            ★ {n}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-400">
                                      المستوي
                                    </span>
                                    <input
                                      className="input min-w-0 flex-1 px-2 py-1.5 text-xs"
                                      placeholder="مستوي هذه المنصة"
                                      value={value.level}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          cards: {
                                            ...f.cards,
                                            [card.id]: {
                                              ...value,
                                              level: e.target.value,
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex gap-2 border-t border-white/10 pt-4">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة المنصة"}
            </button>
            <button type="button" className="btn-soft" onClick={() => setOpen(false)}>
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
