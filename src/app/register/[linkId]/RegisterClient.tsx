"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, CheckCircle2, ShieldAlert, UserPlus } from "lucide-react";
import { normalizePlatform, registerPlayer, useRecords } from "@/lib/store";
import { TYPE_STYLES } from "@/lib/ui";
import SiteFooter from "@/components/layout/SiteFooter";
import type { Platform, Registration, RegistrationLink } from "@/lib/types";

export default function RegisterClient({ linkId }: { linkId: string }) {
  const { records: links, loading: linksLoading } = useRecords<RegistrationLink>("links");
  const { records: registrations } = useRecords<Registration>("registrations");
  const { records: rawPlatforms } = useRecords<Platform>("platforms");

  const link = links.find((l) => l.id === linkId);
  const platforms = (rawPlatforms as unknown[]).map((r) =>
    normalizePlatform(r as Record<string, unknown>)
  );

  const takenIds = useMemo(
    () => new Set(registrations.filter((r) => r.linkId === linkId).map((r) => r.platformId)),
    [registrations, linkId]
  );

  const [selected, setSelected] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function submit() {
    setMessage(null);
    if (!selected) {
      setMessage({ type: "err", text: "اختر المنصة أولاً" });
      return;
    }
    if (!name.trim()) {
      setMessage({ type: "err", text: "اكتب اسم اللاعب" });
      return;
    }
    setSending(true);
    const res = await registerPlayer(linkId, selected, name);
    setSending(false);
    if (res.ok) {
      setMessage({ type: "ok", text: `تم تسجيل ${name.trim()} بنجاح` });
      setName("");
      setSelected("");
    } else {
      setMessage({ type: "err", text: res.error ?? "تعذّر التسجيل" });
    }
  }

  if (linksLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-400">
        جارٍ التحميل...
      </div>
    );
  }

  if (!link) {
    return (
      <EmptyState
        icon={<ShieldAlert size={34} />}
        title="رابط غير موجود"
        text="هذا الرابط لم يعد متاحاً، اطلب رابطاً جديداً من الإدارة."
      />
    );
  }

  if (!link.active) {
    return (
      <EmptyState
        icon={<ShieldAlert size={34} />}
        title="الرابط موقوف"
        text={`رابط «${link.label}» موقوف مؤقتاً من قبل الإدارة.`}
      />
    );
  }

  const free = platforms.filter((p) => !takenIds.has(p.id));

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-[#1a1204]">
          <CalendarRange size={24} />
        </span>
        <div>
          <h1 className="text-xl font-black text-white sm:text-2xl">تسجيل لاعب في منصة</h1>
          <p className="text-xs text-slate-400">
            {link.label} · منصات متاحة: {free.length} من {platforms.length}
          </p>
        </div>
      </header>

      <div className="card p-5">
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label">اسم اللاعب</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك"
              maxLength={40}
            />
          </div>
          <div>
            <label className="label">المنصة المختارة</label>
            <div className="flex h-[42px] items-center rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-bold text-gold-400">
              {selected ? platforms.find((p) => p.id === selected)?.name : "لم تختر بعد"}
            </div>
          </div>
        </div>

        <p className="label">اختر المنصة (يُسمح بلاعب واحد لكل منصة)</p>
        <div className="grid max-h-[46vh] gap-2 overflow-y-auto pl-1 sm:grid-cols-2">
          {platforms.map((p) => {
            const taken = takenIds.has(p.id);
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                disabled={taken}
                onClick={() => setSelected(p.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-right text-sm transition ${
                  taken
                    ? "cursor-not-allowed border-white/5 bg-white/[0.03] opacity-55"
                    : isSelected
                      ? "border-gold-400/70 bg-gold-400/15 shadow-lg shadow-gold-500/10"
                      : "border-white/10 bg-white/[0.05] hover:border-white/25 hover:bg-white/[0.09]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-extrabold text-white">{p.name}</span>
                  <span className={`chip mt-1 ring-1 ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                </span>
                <span
                  className={`shrink-0 text-[11px] font-extrabold ${
                    taken ? "text-rose-300" : "text-emerald-300"
                  }`}
                >
                  {taken ? "محجوزة" : "متاحة"}
                </span>
              </button>
            );
          })}
          {platforms.length === 0 && (
            <p className="text-xs text-slate-500 sm:col-span-2">
              لا توجد منصات متاحة حالياً — تواصل مع الإدارة.
            </p>
          )}
        </div>

        {message && (
          <p
            className={`mt-4 rounded-xl px-3.5 py-2.5 text-xs font-bold ${
              message.type === "ok"
                ? "border border-emerald-400/30 bg-emerald-500/12 text-emerald-200"
                : "border border-rose-400/30 bg-rose-500/12 text-rose-200"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={submit}
          disabled={sending}
        >
          {sending ? "جارٍ التسجيل..." : <><UserPlus size={16} /> تسجيل اللاعب</>}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-xs font-bold text-slate-400 hover:text-gold-300"
        >
          العودة لجدول المنصات
        </Link>
      </div>

      <SiteFooter />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="card w-full max-w-md animate-fade-up p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30">
          {icon}
        </span>
        <h1 className="mt-4 text-lg font-black text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{text}</p>
        <Link href="/" className="btn-soft mt-5 inline-flex">
          <CheckCircle2 size={15} />
          العودة للموقع
        </Link>
      </div>
    </div>
  );
}
