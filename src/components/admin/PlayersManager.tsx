"use client";

import { useState, type FormEvent } from "react";
import {
  Check,
  ClipboardCopy,
  Link2,
  Power,
  RotateCcw,
  Trash2,
  Users,
  UserRoundCheck,
} from "lucide-react";
import {
  clearLinkRegistrations,
  deleteLinkWithRegistrations,
  normalizePlatform,
  saveRecord,
  useRecords,
} from "@/lib/store";
import { firebaseReady } from "@/lib/firebase";
import type { Platform, Registration, RegistrationLink } from "@/lib/types";

export default function PlayersManager() {
  const { records: links } = useRecords<RegistrationLink>("links");
  const { records: registrations } = useRecords<Registration>("registrations");
  const { records: rawPlatforms } = useRecords<Platform>("platforms");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const platforms = (rawPlatforms as unknown[]).map((r) =>
    normalizePlatform(r as Record<string, unknown>)
  );
  const platformName = (id: string) => platforms.find((p) => p.id === id)?.name ?? "منصة محذوفة";
  const takenPlatformIds = new Set(registrations.map((r) => r.platformId));

  function linkUrl(id: string) {
    if (typeof window === "undefined") return `/register/${id}`;
    return `${window.location.origin}/register/${id}`;
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setCreating(true);
    try {
      await saveRecord("links", {
        label: label.trim(),
        active: true,
        createdAt: Date.now(),
      });
      setLabel("");
    } finally {
      setCreating(false);
    }
  }

  async function toggle(link: RegistrationLink) {
    await saveRecord("links", { id: link.id, active: !link.active });
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* تجاهل */
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
            <Users size={16} />
          </span>
          الاعبين وروابط التسجيل
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          أنشئ رابطاً وابعثه للاعبين — يُسمح بلاعب واحد لكل منصة في الرابط الواحد، ويمكنك إيقاف
          الرابط أو مسح التسجيلات وإنشاء رابط جديد.
        </p>
      </div>

      {/* إنشاء رابط */}
      <form onSubmit={onCreate} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">اسم / وصف الرابط الجديد</label>
          <input
            className="input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="مثال: تسجيل أسبوع 1"
          />
        </div>
        <button type="submit" className="btn-primary sm:w-auto" disabled={creating}>
          <Link2 size={16} />
          {creating ? "جارٍ الإنشاء..." : "إنشاء رابط تسجيل"}
        </button>
      </form>

      {!firebaseReady && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-[11px] font-bold text-amber-100">
          وضع تجريبي: الروابط تعمل داخل هذا المتصفح فقط — بعد ربط Firebase ستعمل للجميع.
        </p>
      )}

      {/* الروابط */}
      {links.length === 0 ? (
        <div className="card p-10 text-center text-sm text-slate-400">
          لا توجد روابط تسجيل بعد — أنشئ رابطاً من الأعلى.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const rows = registrations.filter((r) => r.linkId === link.id);
            const isOpen = expanded === link.id;
            return (
              <div key={link.id} className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${
                      link.active
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                        : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                    }`}
                  >
                    <Link2 size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-white">{link.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400" dir="ltr">
                      {linkUrl(link.id)}
                    </p>
                  </div>

                  <span
                    className={`chip ring-1 ${
                      link.active
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                        : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
                    }`}
                  >
                    {link.active ? "مفعّل" : "موقوف"}
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className="icon-btn h-9 w-9 text-sky-300"
                      title="نسخ الرابط"
                      onClick={() => copy(linkUrl(link.id), link.id)}
                    >
                      {copied === link.id ? <Check size={15} /> : <ClipboardCopy size={15} />}
                    </button>
                    <button
                      type="button"
                      className="icon-btn h-9 w-9"
                      title={link.active ? "إيقاف الرابط" : "تفعيل الرابط"}
                      onClick={() => toggle(link)}
                    >
                      <Power size={15} className={link.active ? "text-emerald-300" : "text-rose-300"} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn h-9 w-9 text-amber-300"
                      title="مسح كل التسجيلات"
                      onClick={() => {
                        if (confirm("مسح كل تسجيلات هذا الرابط وإفراغ اللاعبين؟"))
                          clearLinkRegistrations(link.id);
                      }}
                    >
                      <RotateCcw size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn h-9 w-9 text-rose-300"
                      title="حذف الرابط"
                      onClick={() => {
                        if (confirm("حذف الرابط وجميع تسجيلاته؟"))
                          deleteLinkWithRegistrations(link.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-soft px-3 py-2 text-[11px]"
                      onClick={() => setExpanded(isOpen ? null : link.id)}
                    >
                      <UserRoundCheck size={14} />
                      {rows.length} مسجّل
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    {rows.length === 0 ? (
                      <p className="text-xs text-slate-500">لا توجد تسجيلات في هذا الرابط بعد.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {rows.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-xs"
                          >
                            <span className="font-extrabold text-white">{r.playerName}</span>
                            <span className="text-slate-400">{platformName(r.platformId)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* اللاعبون الحاليون على المنصات */}
      <div>
        <h3 className="mb-3 text-sm font-black text-white">
          اللاعبون الحاليون على المنصات ({takenPlatformIds.size})
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs"
            >
              <span className="font-extrabold text-slate-200">{p.name}</span>
              <span
                className={
                  p.castlePlayer ? "font-extrabold text-emerald-300" : "text-slate-500"
                }
              >
                {p.castlePlayer || "شاغرة"}
              </span>
            </div>
          ))}
          {platforms.length === 0 && (
            <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
              أضف منصات أولاً من تبويب «المنصات».
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
