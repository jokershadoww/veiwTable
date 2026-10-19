"use client";

import { useMemo } from "react";
import { BarChart3, Coins, ShieldHalf, Crosshair, Swords, UserCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/layout/SiteFooter";
import { normalizePlatform, useRecords } from "@/lib/store";
import type { Platform } from "@/lib/types";

function BigStat({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="card group relative overflow-hidden p-5 sm:p-6 animate-fade-up">
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl transition group-hover:opacity-60"
        style={{ background: gradient }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 sm:text-sm">{label}</p>
          <p className="mt-2 text-3xl font-black text-white tabular-nums sm:text-4xl">{value}</p>
        </div>
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white ring-1 ring-white/20"
          style={{ background: `linear-gradient(135deg, ${gradient}, transparent 140%)` }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { records: rawPlatforms } = useRecords<Platform>("platforms");

  const platforms = useMemo(
    () => (rawPlatforms as unknown[]).map((r) => normalizePlatform(r as Record<string, unknown>)),
    [rawPlatforms]
  );

  const stats = useMemo(() => {
    // الأنواع السالبة (-رماه / -ثكنة) لا تُحسب في الإحصائيات إطلاقاً
    const counted = platforms.filter((p) => !p.type.startsWith("-"));
    const sum = (key: "barracks" | "archers") =>
      counted.reduce((acc, p) => acc + (Number(p.gold?.[key]) || 0), 0);
    const fmt = (n: number) =>
      n.toLocaleString("en-US", { maximumFractionDigits: 1 });

    return {
      total: counted.length,
      barracksGold: fmt(sum("barracks")),
      archersGold: fmt(sum("archers")),
      archers: counted.filter((p) => p.type === "رماه").length,
      barracks: counted.filter((p) => p.type === "ثكنة").length,
      twoLine: counted.filter((p) => p.type === "خطين").length,
      free: counted.filter((p) => !p.castlePlayer.trim()).length,
    };
  }, [platforms]);

  return (
    <AppShell platformCount={platforms.length} freeCount={stats.free}>
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-sky-500/12 via-white/[0.04] to-gold-500/10 p-5 sm:p-7 animate-fade-up">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />

        <div className="relative">
          <span className="chip bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30">
            <BarChart3 size={12} />
            الإحصائيات
          </span>
          <h1 className="mt-3 bg-gradient-to-l from-sky-300 via-white to-gold-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
            الإحصائيات
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            إجمالي المنصات والمذهب — مذهب الثكنة ومذهب الرماه بالمجاميع.
          </p>
        </div>
      </section>

      {/* الإجماليات الأساسية */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <BigStat
          label="إجمالي عدد المنصات"
          value={stats.total}
          icon={<BarChart3 size={22} />}
          gradient="#38bdf8"
        />
        <BigStat
          label="إجمالي مذهب الثكنة"
          value={stats.barracksGold}
          icon={<ShieldHalf size={22} />}
          gradient="#a78bfa"
        />
        <BigStat
          label="إجمالي مذهب الرماه"
          value={stats.archersGold}
          icon={<Coins size={22} />}
          gradient="#f472b6"
        />
      </div>

      <p className="mt-2 text-[11px] text-slate-500">* القيم بالمليون</p>

      {/* تفصيل إضافي */}
      <h2 className="mt-8 mb-3 flex items-center gap-2 text-sm font-black text-white">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06] text-gold-400">
          <Coins size={14} />
        </span>
        تفصيل المنصات
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <BigStat
          label="منصات الرماه"
          value={stats.archers}
          icon={<Crosshair size={20} />}
          gradient="#f472b6"
        />
        <BigStat
          label="منصات الثكنة"
          value={stats.barracks}
          icon={<ShieldHalf size={20} />}
          gradient="#a78bfa"
        />
        <BigStat
          label="منصات خطين"
          value={stats.twoLine}
          icon={<Swords size={20} />}
          gradient="#34d399"
        />
        <BigStat
          label="لاعبين متوفرين"
          value={stats.free}
          icon={<UserCheck size={20} />}
          gradient="#f7c948"
        />
      </div>

      <p className="mt-4 text-[11px] text-slate-500">
        * الأنواع السالبة (-رماه / -ثكنة) غير محسوبة في الإحصائيات
      </p>

      <SiteFooter />
    </AppShell>
  );
}
