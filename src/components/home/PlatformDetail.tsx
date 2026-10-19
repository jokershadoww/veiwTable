"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  CreditCard,
  Hourglass,
  Info,
  ShieldHalf,
  Stamp,
  User,
  StickyNote,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/layout/SiteFooter";
import { normalizePlatform, useRecords } from "@/lib/store";
import { TYPE_STYLES, formatNum } from "@/lib/ui";
import type { Card, Platform, Seal } from "@/lib/types";

/** بطاقة إحصائية صغيرة */
function MiniStat({
  label,
  value,
  icon,
  tone = "text-slate-100",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
        {icon}
        {label}
      </div>
      <p className={`mt-2 text-xl font-black tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

/** عنوان قسم داخل الصفحة */
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-black text-white sm:text-base">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export default function PlatformDetail({ id }: { id: string }) {
  const { records: rawPlatforms, loading } = useRecords<Platform>("platforms");
  const { records: seals } = useRecords<Seal>("seals");
  const { records: cards } = useRecords<Card>("cards");

  const platforms = useMemo(
    () => (rawPlatforms as unknown[]).map((r) => normalizePlatform(r as Record<string, unknown>)),
    [rawPlatforms]
  );

  const platform = platforms.find((p) => p.id === id);
  const freeCount = platforms.filter((p) => !p.castlePlayer.trim()).length;

  const sealById = useMemo(() => {
    const map = new Map<string, Seal>();
    (seals as unknown[]).forEach((s) => {
      const seal = s as Seal;
      if (seal?.id) map.set(seal.id, seal);
    });
    return map;
  }, [seals]);

  const ownedCards = useMemo(() => {
    if (!platform) return [] as Card[];
    return (cards as unknown[]).filter((c) => Boolean(platform.cards[(c as Card).id])) as Card[];
  }, [cards, platform]);

  if (loading) {
    return (
      <AppShell platformCount={platforms.length} freeCount={freeCount}>
        <div className="card space-y-4 p-6">
          <div className="h-8 w-1/2 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-24 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-40 animate-pulse rounded-xl bg-white/[0.06]" />
        </div>
        <SiteFooter />
      </AppShell>
    );
  }

  if (!platform) {
    return (
      <AppShell platformCount={platforms.length} freeCount={freeCount}>
        <div className="card p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30">
            <Info size={30} />
          </span>
          <h1 className="mt-4 text-lg font-black text-white">المنصة غير موجودة</h1>
          <p className="mt-2 text-sm text-slate-400">
            ربما تم حذف هذه المنصة أو أن الرابط غير صحيح.
          </p>
          <Link href="/" className="btn-soft mt-5 inline-flex">
            <ArrowRight size={15} />
            العودة لجدول المنصات
          </Link>
        </div>
        <SiteFooter />
      </AppShell>
    );
  }

  const taken = Boolean(platform.castlePlayer.trim());

  return (
    <AppShell platformCount={platforms.length} freeCount={freeCount}>
      {/* الترويسة */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-gold-500/12 via-white/[0.04] to-sky-500/10 p-5 sm:p-7 animate-fade-up">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 transition hover:text-gold-300"
            >
              <ArrowRight size={13} />
              العودة لجدول المنصات
            </Link>
            <h1 className="mt-2 bg-gradient-to-l from-gold-300 via-white to-sky-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
              {platform.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`chip ring-1 ${TYPE_STYLES[platform.type]}`}>{platform.type}</span>
              <span
                className={`chip ring-1 ${
                  taken
                    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                    : "bg-gold-400/15 text-gold-400 ring-gold-400/35"
                }`}
              >
                {taken ? `لاعب القلعه: ${platform.castlePlayer}` : "المنصة متاحة"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-center">
            <div className="card px-4 py-3">
              <p className="text-[11px] font-bold text-slate-400">قوة الفيلق</p>
              <p className="text-xl font-black tabular-nums text-white">
                {formatNum(platform.legionPower)}
              </p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-[11px] font-bold text-slate-400">مارد</p>
              <p className="text-xl font-black tabular-nums text-gold-400">
                {formatNum(platform.mard)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* معلومات عامة */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MiniStat
          label="قوة الفيلق"
          value={formatNum(platform.legionPower)}
          icon={<ShieldHalf size={14} />}
        />
        <MiniStat
          label="مارد"
          value={formatNum(platform.mard)}
          icon={<Coins size={14} />}
          tone="text-gold-400"
        />
        <MiniStat
          label="لاعب القلعه"
          value={platform.castlePlayer || "متاح"}
          icon={<User size={14} />}
          tone={taken ? "text-emerald-300" : "text-slate-500"}
        />
        <MiniStat
          label="نوع المنصة"
          value={platform.type}
          icon={<Info size={14} />}
          tone="text-sky-300"
        />
      </div>

      {/* الاختام */}
      <section className="mt-8">
        <SectionTitle icon={<Stamp size={16} />}>الاختام — 6 خانات</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {platform.seals.map((slot, i) => {
            const seal = slot.sealId ? sealById.get(slot.sealId) : undefined;
            return (
              <div
                key={i}
                className={`rounded-2xl border p-3.5 text-center ${
                  seal ? "border-white/10 bg-black/25" : "border-dashed border-white/15"
                }`}
              >
                <p className="text-[10px] font-black text-slate-500">خانة {i + 1}</p>
                {seal ? (
                  <>
                    <p className="mt-2 truncate text-xs font-extrabold text-white" title={seal.name}>
                      {seal.name}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-slate-500">{seal.category}</p>
                    <p className="mt-2 text-sm font-black text-gold-400">
                      {slot.level || "—"}
                    </p>
                  </>
                ) : (
                  <p className="mt-3 text-[11px] text-slate-600">بدون ختم</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* البطايق */}
      <section className="mt-8">
        <SectionTitle icon={<CreditCard size={16} />}>
          البطايق — تمتلك {ownedCards.length} بطاقة
        </SectionTitle>
        {ownedCards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-xs text-slate-400">
            هذه المنصة لا تمتلك أي بطاقة.
          </p>
        ) : (
          <div className="space-y-3">
            {(["sss", "ss"] as const).map((tier) => {
              const list = ownedCards.filter((c) => c.tier === tier);
              if (!list.length) return null;
              return (
                <div key={tier}>
                  <p className="mb-2 text-[11px] font-black uppercase text-slate-400">
                    بطايق {tier}
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((card) => {
                      const a = platform.cards[card.id];
                      return (
                        <div
                          key={card.id}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3.5"
                        >
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-black ${
                              tier === "sss"
                                ? "bg-gradient-to-br from-amber-400 to-orange-600 text-[#1a1204]"
                                : "bg-gradient-to-br from-sky-400 to-indigo-600 text-white"
                            }`}
                          >
                            {tier.toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-extrabold text-white">{card.name}</p>
                            <p className="text-[10px] text-slate-500">{card.classification}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-[11px] font-black text-gold-400" dir="ltr">
                              ★ {a?.stars ?? 0} / {card.maxStars}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400">
                              المستوي: {a?.level || "—"}
                            </p>
                          </div>
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

      {/* الجاهزية */}
      <section className="mt-8">
        <SectionTitle icon={<Hourglass size={16} />}>الجاهزية</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <MiniStat
            label="ساعات حره"
            value={platform.readiness.freeHours}
            icon={<Hourglass size={14} />}
          />
          <MiniStat
            label="ساعات علاج"
            value={platform.readiness.healHours}
            icon={<Hourglass size={14} />}
          />
          <MiniStat
            label="تساريع 50%"
            value={platform.readiness.speed50}
            icon={<Hourglass size={14} />}
          />
          <MiniStat
            label="تساريع 25%"
            value={platform.readiness.speed25}
            icon={<Hourglass size={14} />}
          />
        </div>
      </section>

      {/* المذهب */}
      <section className="mt-8">
        <SectionTitle icon={<Coins size={16} />}>المذهب (بالمليون)</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <MiniStat
            label="مذهب الثكنه"
            value={formatNum(platform.gold.barracks)}
            icon={<ShieldHalf size={14} />}
            tone="text-gold-400"
          />
          <MiniStat
            label="مذهب الرماه"
            value={formatNum(platform.gold.archers)}
            icon={<Coins size={14} />}
            tone="text-gold-400"
          />
        </div>
      </section>

      {/* الملاحظات */}
      <section className="mt-8">
        <SectionTitle icon={<StickyNote size={16} />}>ملاحظات</SectionTitle>
        <p className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-slate-300">
          {platform.notes || "لا توجد ملاحظات لهذه المنصة."}
        </p>
      </section>

      <SiteFooter />
    </AppShell>
  );
}
