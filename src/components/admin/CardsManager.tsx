"use client";

import { useState, type FormEvent } from "react";
import { CreditCard, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Card, CardTier } from "@/lib/types";
import { deleteRecord, saveRecord, useRecords } from "@/lib/store";

interface CardForm {
  id?: string;
  name: string;
  tier: CardTier;
  classification: string;
  maxStars: number;
}

const blank: CardForm = { name: "", tier: "sss", classification: "", maxStars: 6 };

export default function CardsManager() {
  const { records: cards } = useRecords<Card>("cards");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CardForm>(blank);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"الكل" | CardTier>("الكل");

  const rows = cards.filter((c) => filter === "الكل" || c.tier === filter);

  function openAdd() {
    setForm(blank);
    setOpen(true);
  }

  function openEdit(c: Card) {
    setForm({
      id: c.id,
      name: c.name,
      tier: c.tier,
      classification: c.classification,
      maxStars: c.maxStars,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await saveRecord("cards", { ...form, name: form.name.trim() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c: Card) {
    if (!confirm(`حذف البطاقة "${c.name}"؟`)) return;
    await deleteRecord("cards", c.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              <CreditCard size={16} />
            </span>
            إدارة البطايق
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {cards.length} بطاقة · النجومية والمستوي يُحدَّدان لكل منصة على حدة
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={16} />
          إضافة بطاقة
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["الكل", "الكل"],
            ["sss", "بطايق SSS"],
            ["ss", "بطايق SS"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
              filter === key
                ? "bg-gradient-to-r from-gold-400 to-amber-500 text-[#1a1204]"
                : "bg-white/[0.06] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.12]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">
          لا توجد بطايق — اضغط «إضافة بطاقة».
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-black ${
                    c.tier === "sss"
                      ? "bg-gradient-to-br from-amber-400 to-orange-600 text-[#1a1204]"
                      : "bg-gradient-to-br from-sky-400 to-indigo-600 text-white"
                  }`}
                >
                  {c.tier.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-white">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    تصنيف: {c.classification || "—"}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 text-gold-400"
                    title="تعديل"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn h-8 w-8 text-rose-300"
                    title="حذف"
                    onClick={() => onDelete(c)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 rounded-xl bg-black/25 px-3 py-2 text-gold-400">
                <Star size={14} className="fill-gold-400" />
                <span className="text-xs font-extrabold">
                  أقصى نجومية: {c.maxStars} نجوم
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "تعديل بطاقة" : "إضافة بطاقة جديدة"}
        subtitle="الاسم والتصنيف والنجمية القصوى"
        icon={<CreditCard size={19} />}
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">اسم البطاقة</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: بطاقة المغير"
              required
            />
          </div>

          <div>
            <label className="label">النوع</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["sss", "بطايق SSS"],
                  ["ss", "بطايق SS"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, tier: key, maxStars: key === "sss" ? 6 : form.maxStars })
                  }
                  className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
                    form.tier === key
                      ? "bg-gold-400 text-[#1a1204]"
                      : "bg-white/[0.06] text-slate-300 ring-1 ring-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">التصنيف</label>
              <input
                className="input"
                value={form.classification}
                onChange={(e) => setForm({ ...form, classification: e.target.value })}
                placeholder="هجومية / دفاعية..."
              />
            </div>
            <div>
              <label className="label">أقصى نجومية</label>
              <select
                className="input"
                value={form.maxStars}
                onChange={(e) => setForm({ ...form, maxStars: Number(e.target.value) })}
              >
                {[3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n} className="bg-[#0b1020]">
                    {n} نجوم
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : "حفظ"}
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
