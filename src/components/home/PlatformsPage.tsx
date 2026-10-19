"use client";

import { useMemo } from "react";
import { AlertTriangle, Radio } from "lucide-react";
import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/layout/SiteFooter";
import PlatformsSection from "@/components/home/PlatformsSection";
import { firebaseReady } from "@/lib/firebase";
import { normalizePlatform, useRecords } from "@/lib/store";
import type { Card, Platform, Seal } from "@/lib/types";

export default function PlatformsPage() {
  const { records: rawPlatforms, loading, error } = useRecords<Platform>("platforms");
  const { records: seals } = useRecords<Seal>("seals");
  const { records: cards } = useRecords<Card>("cards");

  const platforms = useMemo(
    () => (rawPlatforms as unknown[]).map((r) => normalizePlatform(r as Record<string, unknown>)),
    [rawPlatforms]
  );

  const freeCount = platforms.filter((p) => !p.castlePlayer.trim()).length;

  return (
    <AppShell platformCount={platforms.length} freeCount={freeCount}>
      {/* الترويسة */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-gold-500/12 via-white/[0.04] to-sky-500/10 p-5 sm:p-7 animate-fade-up">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <Radio size={12} className="animate-pulse" />
              بيانات مباشرة
            </span>
            <h1 className="mt-3 bg-gradient-to-l from-gold-300 via-white to-sky-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
              منصات 326
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              جدول متابعة شامل للمنصات — القوة، المارد، الاختام، البطايق، الجاهزية، المذهب
              واللاعبين في مكان واحد.
            </p>
          </div>

          <div className="flex gap-2 text-center">
            <div className="card px-4 py-3">
              <p className="text-[11px] font-bold text-slate-400">منصات</p>
              <p className="text-xl font-black text-white">{platforms.length}</p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[11px] font-bold text-slate-400">شاغرة</p>
              <p className="text-xl font-black text-emerald-300">{freeCount}</p>
            </div>
          </div>
        </div>

        {!firebaseReady && (
          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-amber-100">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed">
              <span className="font-extrabold">وضع تجريبي:</span> لم يتم ربط Firebase بعد، لذا
              البيانات الحالية تجريبية وتُحفظ في المتصفح فقط. أضف مفاتيح مشروعك في{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5">.env.local</code> لتبدأ البيانات
              اللحظية — كل شيء جاهز للعمل بدون أي تعديل إضافي.
            </p>
          </div>
        )}

        {firebaseReady && error && (
          <div className="relative mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/35 bg-rose-500/12 p-3.5 text-rose-100">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />
            <p className="text-xs leading-relaxed">
              <span className="font-extrabold">تعذّر الاتصال بقاعدة البيانات.</span> تأكد من نشر
              قواعد الأمان (Security rules) في Firebase → Realtime Database → Rules، ومن أن قاعدة
              البيانات أُنشئت ولم تُغلق على الزوار.
            </p>
          </div>
        )}
      </section>

      <div className="space-y-8">
        <PlatformsSection platforms={platforms} seals={seals} cards={cards} loading={loading} />
      </div>

      <SiteFooter />
    </AppShell>
  );
}
