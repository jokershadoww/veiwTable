"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Card, Platform } from "@/lib/types";
import type { CardTier } from "@/lib/types";

export default function CardsModal({
  open,
  onClose,
  platform,
  cards,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform | null;
  cards: Card[];
}) {
  const [tab, setTab] = useState<CardTier>("sss");

  const cardMap = platform?.cards ?? {};
  /** تعرض البطايق الممتلكة فقط */
  const owned = cards.filter((c) => Boolean(cardMap[c.id]));
  const list = owned.filter((c) => c.tier === tab);

  const tabs = [
    { key: "sss" as CardTier, label: "بطايق SSS" },
    { key: "ss" as CardTier, label: "بطايق SS" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`بطايق ${platform?.name ?? ""}`}
      subtitle={`تمتلك ${owned.length} بطاقة`}
      icon={<CreditCard size={19} />}
      size="lg"
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1.5">
        {tabs.map((t) => {
          const count = owned.filter((c) => c.tier === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
                tab === t.key
                  ? "bg-gradient-to-r from-gold-400 to-amber-500 text-[#1a1204] shadow-lg shadow-gold-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
          لا تمتلك هذه المنصة أي بطاقة من هذا النوع.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((card) => {
            const assignment = cardMap[card.id];
            if (!assignment) return null;
            return (
              <div
                key={card.id}
                className="card flex flex-wrap items-center gap-4 p-4 transition hover:border-gold-400/40"
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-black ${
                    card.tier === "sss"
                      ? "bg-gradient-to-br from-amber-400 to-orange-600 text-[#1a1204]"
                      : "bg-gradient-to-br from-sky-400 to-indigo-600 text-white"
                  }`}
                >
                  {card.tier.toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-white">{card.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="chip bg-white/8 text-slate-300">{card.classification}</span>
                  </div>
                </div>

                <div className="text-left">
                  <div className="space-y-1.5">
                    <span className="chip bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/35">
                      <CheckCircle2 size={13} />
                      تمتلكها
                    </span>
                    <p className="text-[11px] font-bold text-gold-400" dir="ltr">
                      ★ {assignment.stars} / {card.maxStars}
                    </p>
                    <p className="text-[11px] font-bold text-gold-400">
                      المستوي: {assignment.level || "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
