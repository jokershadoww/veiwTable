"use client";

import { Users, UserRoundCheck, UserRoundX } from "lucide-react";
import Link from "next/link";
import type { Platform } from "@/lib/types";
import { TYPE_STYLES } from "@/lib/ui";

export default function PlayersSection({ platforms }: { platforms: Platform[] }) {
  const withPlayer = platforms.filter((p) => p.castlePlayer.trim());
  const free = platforms.filter((p) => !p.castlePlayer.trim());

  return (
    <section id="players" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              <Users size={16} />
            </span>
            الاعبين
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {withPlayer.length} منصة مشغولة · {free.length} منصة متاحة
          </p>
        </div>
        <Link href="/admin" className="btn-soft text-xs">
          إدارة اللاعبين من لوحة الأدمن
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {platforms.map((p, i) => {
          const taken = Boolean(p.castlePlayer.trim());
          return (
            <div
              key={p.id}
              className={`card animate-fade-up p-4 transition hover:-translate-y-0.5 ${
                taken ? "" : "border-gold-400/35"
              }`}
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ${
                    taken
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                      : "bg-gold-400/15 text-gold-400 ring-gold-400/35"
                  }`}
                >
                  {taken ? <UserRoundCheck size={20} /> : <UserRoundX size={20} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-white">{p.name}</p>
                  <span className={`chip mt-1 ring-1 ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-black/25 px-3 py-2.5">
                <span className="text-[11px] font-bold text-slate-400">اللاعب الحالي</span>
                <span
                  className={`text-sm font-extrabold ${
                    taken ? "text-emerald-300" : "text-slate-500"
                  }`}
                >
                  {taken ? p.castlePlayer : "شاغرة"}
                </span>
              </div>
            </div>
          );
        })}

        {platforms.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-400 sm:col-span-2 xl:col-span-4">
            لا توجد منصات بعد — أضفها من لوحة الأدمن.
          </div>
        )}
      </div>
    </section>
  );
}
