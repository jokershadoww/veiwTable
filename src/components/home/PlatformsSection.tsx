"use client";

import { useMemo, useState } from "react";
import { Coins, CreditCard, Hourglass, Search, Stamp, Table2 } from "lucide-react";
import type { Card, Platform, Seal } from "@/lib/types";
import { PLATFORM_TYPES } from "@/lib/types";
import { TYPE_STYLES, formatNum } from "@/lib/ui";
import SealsModal from "./SealsModal";
import CardsModal from "./CardsModal";
import ReadinessModal from "./ReadinessModal";
import GoldModal from "./GoldModal";

type ModalKind = "seals" | "cards" | "readiness" | "gold" | null;

export default function PlatformsSection({
  platforms,
  seals,
  cards,
  loading,
}: {
  platforms: Platform[];
  seals: Seal[];
  cards: Card[];
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("الكل");
  const [modal, setModal] = useState<ModalKind>(null);
  const [active, setActive] = useState<Platform | null>(null);

  const rows = useMemo(() => {
    const q = search.trim();
    return platforms.filter((p) => {
      const okType = filter === "الكل" || p.type === filter;
      const okSearch =
        !q || p.name.includes(q) || p.castlePlayer.includes(q) || p.notes.includes(q);
      return okType && okSearch;
    });
  }, [platforms, search, filter]);

  const open = (kind: ModalKind, platform: Platform) => {
    setActive(platform);
    setModal(kind);
  };

  const close = () => setModal(null);

  const ActionIcons = ({ p }: { p: Platform }) => (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        title="الاختام"
        onClick={() => open("seals", p)}
        className="icon-btn h-8 w-8 text-gold-400"
      >
        <Stamp size={15} />
      </button>
      <button
        type="button"
        title="البطايق"
        onClick={() => open("cards", p)}
        className="icon-btn h-8 w-8 text-sky-300"
      >
        <CreditCard size={15} />
      </button>
      <button
        type="button"
        title="الجاهزية"
        onClick={() => open("readiness", p)}
        className="icon-btn h-8 w-8 text-emerald-300"
      >
        <Hourglass size={15} />
      </button>
      <button
        type="button"
        title="المذهب"
        onClick={() => open("gold", p)}
        className="icon-btn h-8 w-8 text-amber-300"
      >
        <Coins size={15} />
      </button>
    </div>
  );

  return (
    <section id="table" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white sm:text-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              <Table2 size={16} />
            </span>
            جدول المنصات
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {rows.length} منصة معروضة من أصل {platforms.length}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pr-10"
            placeholder="ابحث باسم المنصة أو اللاعب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* فلاتر الأنواع */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["الكل", ...PLATFORM_TYPES].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
              filter === t
                ? "bg-gradient-to-r from-gold-400 to-amber-500 text-[#1a1204] shadow-lg shadow-gold-500/25"
                : "bg-white/[0.06] text-slate-300 ring-1 ring-white/10 hover:bg-white/[0.12]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card space-y-3 p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-bold text-slate-300">لا توجد منصات مطابقة</p>
          <p className="mt-1 text-xs text-slate-500">جرّب تغيير الفلتر أو كلمة البحث</p>
        </div>
      ) : (
        <>
          {/* جدول — الحواسيب */}
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم المنصه</th>
                  <th>نوع المنصه</th>
                  <th>قوة الفيلق</th>
                  <th>مارد</th>
                  <th className="text-center">اختام · بطايق · جاهزية · مذهب</th>
                  <th>لاعب القلعه</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="font-extrabold text-white">{p.name}</td>
                    <td>
                      <span className={`chip ring-1 ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                    </td>
                    <td className="font-bold tabular-nums text-slate-200">
                      {formatNum(p.legionPower)}
                    </td>
                    <td className="font-bold tabular-nums text-gold-400">{formatNum(p.mard)}</td>
                    <td>
                      <ActionIcons p={p} />
                    </td>
                    <td className="text-center text-slate-500">
                      {p.castlePlayer ? (
                        <span className="chip bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
                          {p.castlePlayer}
                        </span>
                      ) : (
                        <span className="chip bg-white/8 text-slate-500">متاح</span>
                      )}
                    </td>
                    <td className="max-w-[180px]">
                      <p className="truncate text-xs text-slate-400">{p.notes || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* كروت — الهواتف */}
          <div className="space-y-3 md:hidden">
            {rows.map((p) => (
              <div key={p.id} className="card p-4 animate-fade-up">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-extrabold text-white">{p.name}</h3>
                    </div>
                    <span className={`chip mt-1.5 ring-1 ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                  </div>
                  <span
                    className={`chip shrink-0 ring-1 ${
                      p.castlePlayer
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                        : "bg-white/8 text-slate-400 ring-white/10"
                    }`}
                  >
                    {p.castlePlayer || "متاح"}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-black/25 p-2.5">
                    <p className="text-[10px] font-bold text-slate-400">قوة الفيلق</p>
                    <p className="text-sm font-black tabular-nums text-slate-100">
                      {formatNum(p.legionPower)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/25 p-2.5">
                    <p className="text-[10px] font-bold text-slate-400">مارد</p>
                    <p className="text-sm font-black tabular-nums text-gold-400">
                      {formatNum(p.mard)}
                    </p>
                  </div>
                </div>

                {p.notes && (
                  <p className="mt-2.5 rounded-xl bg-white/[0.05] p-2.5 text-[11px] leading-relaxed text-slate-400">
                    {p.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[11px] font-bold text-slate-500">التفاصيل</span>
                  <ActionIcons p={p} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SealsModal open={modal === "seals"} onClose={close} platform={active} seals={seals} />
      <CardsModal open={modal === "cards"} onClose={close} platform={active} cards={cards} />
      <ReadinessModal open={modal === "readiness"} onClose={close} platform={active} />
      <GoldModal open={modal === "gold"} onClose={close} platform={active} />
    </section>
  );
}
