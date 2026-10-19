"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import SiteFooter from "@/components/layout/SiteFooter";
import PlayersSection from "@/components/home/PlayersSection";
import { normalizePlatform, useRecords } from "@/lib/store";
import type { Platform } from "@/lib/types";

export default function PlayersPage() {
  const { records: rawPlatforms } = useRecords<Platform>("platforms");

  const platforms = useMemo(
    () => (rawPlatforms as unknown[]).map((r) => normalizePlatform(r as Record<string, unknown>)),
    [rawPlatforms]
  );

  const freeCount = platforms.filter((p) => !p.castlePlayer.trim()).length;

  return (
    <AppShell platformCount={platforms.length} freeCount={freeCount}>
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-l from-emerald-500/12 via-white/[0.04] to-sky-500/10 p-5 sm:p-7 animate-fade-up">
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

        <div className="relative">
          <span className="chip bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            <Users size={12} />
            اللاعبين
          </span>
          <h1 className="mt-3 bg-gradient-to-l from-emerald-300 via-white to-sky-300 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
            الاعبين
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            حالة كل منصة — هل يوجد بها لاعب أم أنها شاغرة، مع إمكانية التسجيل عبر روابط الدعوة.
          </p>
        </div>
      </section>

      <PlayersSection platforms={platforms} />

      <SiteFooter />
    </AppShell>
  );
}
