"use client";

import { useState } from "react";
import { CreditCard, Layers, Stamp, Users } from "lucide-react";
import PlatformsManager from "@/components/admin/PlatformsManager";
import SealsManager from "@/components/admin/SealsManager";
import CardsManager from "@/components/admin/CardsManager";
import PlayersManager from "@/components/admin/PlayersManager";

type Tab = "platforms" | "seals" | "cards" | "players";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "platforms", label: "المنصات", icon: <Layers size={16} /> },
  { key: "seals", label: "الاختام", icon: <Stamp size={16} /> },
  { key: "cards", label: "البطايق", icon: <CreditCard size={16} /> },
  { key: "players", label: "الاعبين", icon: <Users size={16} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("platforms");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/25 p-1.5 sm:grid-cols-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold transition ${
              tab === t.key
                ? "bg-gradient-to-r from-gold-400 to-amber-500 text-[#1a1204] shadow-lg shadow-gold-500/25"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-up" key={tab}>
        {tab === "platforms" && <PlatformsManager />}
        {tab === "seals" && <SealsManager />}
        {tab === "cards" && <CardsManager />}
        {tab === "players" && <PlayersManager />}
      </div>
    </div>
  );
}
