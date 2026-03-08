"use client";

import { useEffect, useMemo, useState } from "react";

type Proposal = { title: string; text: string; organique?: boolean };
type ProvinceControl =
  | "Indépendant"
  | "Autonomie"
  | "Sédition"
  | "Insoumission"
  | "Contestation"
  | "Équilibre"
  | "Stable"
  | "Prospère"
  | "Pacifié"
  | "Contrôle Total"
  | "En Guerre";

type ProvinceState = Record<string, ProvinceControl>;

type ProposalsState = {
  proposals?: Proposal[];
  countrySituation?: string;
  isCrisis?: boolean;
  crisisDescription?: string;
  provinces?: ProvinceState;
  economyGauge?: number;
  socialGauge?: number;
  securityGauge?: number;
  budgetGauge?: number;
};

export default function PropositionsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { title: "", text: "", organique: false },
    { title: "", text: "", organique: false },
    { title: "", text: "", organique: false },
  ]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [countrySituation, setCountrySituation] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [crisisDescription, setCrisisDescription] = useState("");
  const [provinces, setProvinces] = useState<ProvinceState>({});
  const [economyGauge, setEconomyGauge] = useState(0);
  const [socialGauge, setSocialGauge] = useState(0);
  const [securityGauge, setSecurityGauge] = useState(0);
  const [budgetGauge, setBudgetGauge] = useState(0);

  const clampedBudget = useMemo(() => Math.max(-5, Math.min(5, budgetGauge)), [budgetGauge]);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("hemicycleState");
      if (!raw) return;
      try {
        const parsed: ProposalsState = JSON.parse(raw);

        const next = (parsed.proposals ?? []).slice(0, 3);
        while (next.length < 3) next.push({ title: "", text: "", organique: false });
        setProposals(next);

        setCountrySituation(parsed.countrySituation ?? "");
        setIsCrisis(parsed.isCrisis ?? false);
        setCrisisDescription(parsed.crisisDescription ?? "");
        setProvinces(parsed.provinces ?? {});
        setEconomyGauge(parsed.economyGauge ?? 0);
        setSocialGauge(parsed.socialGauge ?? 0);
        setSecurityGauge(parsed.securityGauge ?? 0);
        setBudgetGauge(parsed.budgetGauge ?? 0);
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

  useEffect(() => {
    // Auto fullscreen si ouvert avec ?fs=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("fs") === "1") {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    const openWithFs = (path: string) => {
      const fs = !!document.fullscreenElement;
      const url = fs ? `${path}?fs=1` : path;
      window.open(url, "_blank", "noopener,noreferrer");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable;

      if (isTyping) return;

      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        return;
      }

      if (e.key === "1") openWithFs("/display");
      if (e.key === "2") openWithFs("/propositions");
      if (e.key === "3") openWithFs("/notes");
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative">
      <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Ordre Du Jour</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proposals.map((p, i) => (
            <div
              key={`proposal-${i}`}
              className={`rounded-lg border p-4 ${
                p.organique
                  ? "border-violet-300 dark:border-violet-700 bg-violet-100 dark:bg-violet-950/40"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              }`}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {p.title || `Proposition ${i + 1}`}
              </h2>
              {p.organique ? (
                <p className="mt-1 text-xs font-semibold text-violet-800 dark:text-violet-300">Loi organique</p>
              ) : null}
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {p.text || "Aucun texte"}
              </p>
            </div>
          ))}
        </div>

        {/* Nouvelle zone bas: gauche 1/3, droite 2/3 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gauche (1/3) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Niveau de Contrôle des Provinces
              </h3>
              <div className="space-y-2">
                {(Object.keys(provinces) as string[]).length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Aucune province.</p>
                ) : (
                  (Object.keys(provinces) as string[]).map((name) => (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">{name}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{provinces[name]}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Jauges de la République</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Économie</span>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">{economyGauge}/10</span>
                  </div>
                  <div className="h-3 rounded-full bg-green-100 dark:bg-green-950 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(economyGauge / 10) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Social</span>
                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">{socialGauge}/10</span>
                  </div>
                  <div className="h-3 rounded-full bg-red-100 dark:bg-red-950 overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(socialGauge / 10) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Sécurité</span>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{securityGauge}/10</span>
                  </div>
                  <div className="h-3 rounded-full bg-blue-100 dark:bg-blue-950 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(securityGauge / 10) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Budget</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {clampedBudget > 0 ? `+${clampedBudget}` : clampedBudget}
                    </span>
                  </div>
                  <div className="grid grid-cols-11 gap-0 max-w-[220px] justify-items-center">
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const center = 5;
                      const distance = idx - center;
                      if (distance === 0) {
                        return <div key={`b-center-${idx}`} className="h-4 w-4 rounded-sm border border-gray-400 bg-white" />;
                      }
                      if (distance < 0) {
                        const show = clampedBudget < 0 && -distance <= -clampedBudget;
                        return show ? (
                          <div key={`b-neg-${idx}`} className="h-4 w-4 rounded-sm border border-red-700 bg-red-500" />
                        ) : (
                          <div key={`b-neg-empty-${idx}`} className="h-4 w-4" />
                        );
                      }
                      const show = clampedBudget > 0 && distance <= clampedBudget;
                      return show ? (
                        <div key={`b-pos-${idx}`} className="h-4 w-4 rounded-sm border border-green-700 bg-green-500" />
                      ) : (
                        <div key={`b-pos-empty-${idx}`} className="h-4 w-4" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Droite (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`rounded-lg p-4 border ${
                isCrisis
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-2 ${
                  isCrisis ? "text-red-800 dark:text-red-200" : "text-blue-800 dark:text-blue-200"
                }`}
              >
                {isCrisis ? "Situation de crise" : "Situation Normale"}
              </h3>
              <p
                className={`text-sm whitespace-pre-wrap break-words min-h-16 ${
                  isCrisis ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isCrisis
                  ? crisisDescription || "Crise déclarée, description non renseignée."
                  : "Jusqu'à preuve du contraire, tout va bien."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">L&apos;essentiel de l&apos;info</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words min-h-16">
                {countrySituation || "Aucune information renseignée."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
