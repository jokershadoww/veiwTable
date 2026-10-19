"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Stamp, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { SEAL_CATEGORIES, type Seal, type SealCategory } from "@/lib/types";
import { deleteRecord, saveRecord, useRecords } from "@/lib/store";

const CATEGORY_STYLE: Record<SealCategory, string> = {
  "الثكنه": "bg-violet-500/18 text-violet-300 ring-violet-400/35",
  "الرماه": "bg-sky-500/18 text-sky-300 ring-sky-400/35",
  "العادية": "bg-emerald-500/18 text-emerald-300 ring-emerald-400/35",
  "النادره": "bg-amber-500/18 text-amber-300 ring-amber-400/35",
};

export default function SealsManager() {
  const { records: seals } = useRecords<Seal>("seals");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ id?: string; name: string; category: SealCategory }>({
    name: "",
    category: "الثكنه",
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"الكل" | SealCategory>("الكل");

  const rows = seals.filter((s) => filter === "الكل" || s.category === filter);

  function openAdd() {
    setForm({ name: "", category: "الثكنه" });
    setOpen(true);
  }

  function openEdit(s: Seal) {
    setForm({ id: s.id, name: s.name, category: s.category });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await saveRecord("seals", { ...form, name: form.name.trim() });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(s: Seal) {
    if (!confirm(`حذف الختم "${s.name}"؟`)) return;
    await deleteRecord("seals", s.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              <Stamp size={16} />
            </span>
            إدارة الاختام
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {seals.length} ختم · مقسّمة لـ 4 أقسام لتسهيل الاختيار
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus size={16} />
          إضافة ختم
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["الكل", ...SEAL_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
              filter === c
                ? "bg-gradient-to-r from-gold-400 to-amber-500 text-[#1a1204]"
                : "bg-white/[0.06] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.12]"
            }`}
          >
            {c}
            {c !== "الكل" && (
              <span className="mr-1.5 opacity-70">
                {seals.filter((s) => s.category === c).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">
          لا توجد اختام في هذا القسم — اضغط «إضافة ختم».
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <div key={s.id} className="card flex items-center gap-3 p-4">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${
                  CATEGORY_STYLE[s.category]
                }`}
              >
                <Stamp size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-white">{s.name}</p>
                <span className={`chip mt-1 ring-1 ${CATEGORY_STYLE[s.category]}`}>
                  {s.category}
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="icon-btn h-8 w-8 text-gold-400"
                  title="تعديل"
                  onClick={() => openEdit(s)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="icon-btn h-8 w-8 text-rose-300"
                  title="حذف"
                  onClick={() => onDelete(s)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "تعديل ختم" : "إضافة ختم جديد"}
        subtitle="اختر القسم الذي ينتمي إليه الختم"
        icon={<Stamp size={19} />}
        size="sm"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">اسم الختم</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: ختم الحرب"
              required
            />
          </div>
          <div>
            <label className="label">القسم</label>
            <div className="grid grid-cols-2 gap-2">
              {SEAL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  className={`rounded-xl px-3 py-2.5 text-xs font-extrabold transition ${
                    form.category === c
                      ? "bg-gold-400 text-[#1a1204]"
                      : "bg-white/[0.06] text-slate-300 ring-1 ring-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
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
