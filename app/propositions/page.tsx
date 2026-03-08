"use client";

import { useEffect, useState } from "react";

type Proposal = { title: string; text: string; organique?: boolean };
type ProposalsState = { proposals?: Proposal[] };

export default function PropositionsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { title: "", text: "", organique: false },
    { title: "", text: "", organique: false },
    { title: "", text: "", organique: false },
  ]);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("hemicycleState");
      if (!raw) return;
      try {
        const parsed: ProposalsState = JSON.parse(raw);
        const next = (parsed.proposals ?? []).slice(0, 3);
        while (next.length < 3) next.push({ title: "", text: "", organique: false });
        setProposals(next);
      } catch {}
    };

    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hemicycleState") load();
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(load, 300);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">3 propositions de loi</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proposals.map((p, i) => (
            <div
              key={`proposal-${i}`}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {p.title || `Proposition ${i + 1}`}
              </h2>
              {p.organique ? (
                <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  Loi organique
                </p>
              ) : null}
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {p.text || "Aucun texte"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
