"use client";

import { useMemo, useState } from "react";
import { Stamp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Platform, Seal } from "@/lib/types";
import { SEAL_CATEGORIES, type SealCategory } from "@/lib/types";

const SECTOR_COLORS = ["#f7c948", "#38bdf8", "#a78bfa", "#34d399", "#f472b6", "#fb923c"];

function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function SealsModal({
  open,
  onClose,
  platform,
  seals,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform | null;
  seals: Seal[];
}) {
  const [selected, setSelected] = useState(0);

  const slots = platform?.seals ?? [];
  const current = slots[selected];
  const currentSeal = seals.find((s) => s.id === current?.sealId) ?? null;

  const sectors = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        i,
        path: sectorPath(50, 50, 46, i * 60 + 2, (i + 1) * 60 - 2),
        mid: i * 60 + 30,
      })),
    []
  );

  const labelPos = (mid: number) => {
    const rad = ((mid - 90) * Math.PI) / 180;
    return { left: `${50 + 33 * Math.cos(rad)}%`, top: `${50 + 33 * Math.sin(rad)}%` };
  };

  const filled = slots.filter((s) => s.sealId).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`اختام ${platform?.name ?? ""}`}
      subtitle={`${filled} من 6 خانات معبّأة`}
      icon={<Stamp size={19} />}
      size="lg"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,300px)_1fr]">
        {/* الدائرة المقسّمة لـ 6 خانات */}
        <div className="relative mx-auto aspect-square w-full max-w-[300px]">
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-2xl">
            <circle cx="50" cy="50" r="47" fill="rgba(255,255,255,0.04)" />
            {sectors.map(({ i, path }) => {
              const slot = slots[i];
              const active = i === selected;
              return (
                <path
                  key={i}
                  d={path}
                  fill={slot?.sealId ? SECTOR_COLORS[i] : "rgba(255,255,255,0.06)"}
                  fillOpacity={slot?.sealId ? (active ? 1 : 0.72) : 1}
                  stroke={active ? "#ffffff" : "rgba(6,10,22,0.85)"}
                  strokeWidth={active ? 1.6 : 1}
                  className="cursor-pointer transition-all duration-200 hover:opacity-100"
                  onClick={() => setSelected(i)}
                />
              );
            })}
            <circle cx="50" cy="50" r="15" fill="#0a0f20" stroke="rgba(255,255,255,0.15)" />
          </svg>

          {sectors.map(({ i, mid }) => {
            const seal = seals.find((s) => s.id === slots[i]?.sealId);
            const pos = labelPos(mid);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                style={pos}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg px-1.5 py-0.5 text-center text-[10px] font-extrabold leading-tight transition sm:text-[11px] ${
                  i === selected
                    ? "bg-black/45 text-white ring-1 ring-white/60"
                    : seal
                      ? "bg-black/35 text-white/90"
                      : "text-slate-400"
                }`}
              >
                {seal ? seal.name.slice(0, 12) : `خانة ${i + 1}`}
              </button>
            );
          })}

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400">المنصة</p>
              <p className="max-w-[86px] truncate text-sm font-black text-gold-400">
                {platform?.name}
              </p>
            </div>
          </div>
        </div>

        {/* تفاصيل الخانة المختارة */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-white">الخانة {selected + 1}</p>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`خانة ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === selected ? "w-6 bg-gold-400" : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="card p-4">
            {!currentSeal ? (
              <p className="text-sm text-slate-400">هذه الخانة فارغة — لم يتم وضع ختم فيها.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-11 w-11 shrink-0 rounded-xl ring-1 ring-white/25"
                    style={{
                      background: `linear-gradient(135deg, ${SECTOR_COLORS[selected]}, transparent 150%)`,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-white">{currentSeal.name}</p>
                    <span className="chip mt-1 bg-white/10 text-slate-300">
                      {currentSeal.category}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/25 p-3">
                    <p className="text-[11px] font-bold text-slate-400">المستوي</p>
                    <p className="mt-1 text-lg font-black text-gold-400">
                      {current?.level || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/25 p-3">
                    <p className="text-[11px] font-bold text-slate-400">رقم الخانة</p>
                    <p className="mt-1 text-lg font-black text-white">{selected + 1}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {SEAL_CATEGORIES.map((cat: SealCategory) => {
              const inCat = seals.filter((s) => s.category === cat);
              const has = inCat.some((s) => s.id === currentSeal?.id);
              return (
                <span
                  key={cat}
                  className={`chip ${
                    has ? "bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/40" : "bg-white/8 text-slate-300"
                  }`}
                >
                  {cat} · {inCat.length}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
