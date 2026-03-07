"use client";

import { useEffect, useMemo, useState } from "react";
import Hemicycle from "./components/Hemicycle";

type SeatColor = "white" | "green" | "red" | "orange" | "black";
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

type ProvinceState = {
  "201D": ProvinceControl;
  "202D-Plateau": ProvinceControl;
  "202D-Profond": ProvinceControl;
  "204D": ProvinceControl;
  "Provinces des Plasticiens": ProvinceControl;
  "Etat de Tori Valu": ProvinceControl;
};

type PassedLaw = {
  title: string;
  text: string;
  abrogee?: boolean;
  adopteeSousEnclume?: boolean;
};

const CONTROL_OPTIONS: ProvinceControl[] = [
    "Indépendant",
    "Autonomie",
    "Sédition",
    "Insoumission",
    "Contestation",
    "Équilibre",
    "Stable",
    "Prospère",
    "Pacifié",
    "Contrôle Total",
    "En Guerre"
];

const SUPER_MAJORITY_OPTIONS = ["3/5", "2/3", "7/10" ,"3/4"] as const;
const VETO_OPTIONS = ["none", "president", "player"] as const;
type VetoMode = (typeof VETO_OPTIONS)[number];

type EnclumeStatus = "idle" | "running" | "adopted" | "rejected";

export default function Home() {
  const [numSeats, setNumSeats] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [seatColors, setSeatColors] = useState<SeatColor[]>([]);
  const [presidentColor, setPresidentColor] = useState<SeatColor>("white");
  const [economyGauge, setEconomyGauge] = useState(5);
  const [socialGauge, setSocialGauge] = useState(5);
  const [securityGauge, setSecurityGauge] = useState(5);
  const [countrySituation, setCountrySituation] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [crisisDescription, setCrisisDescription] = useState("");
  const [provinces, setProvinces] = useState<ProvinceState>({
    "201D": "Indépendant",
    "202D-Plateau": "Indépendant",
    "202D-Profond": "Indépendant",
    "204D": "Indépendant",
    "Provinces des Plasticiens": "Indépendant",
    "Etat de Tori Valu": "Indépendant",
  });
  const [passedLaws, setPassedLaws] = useState<PassedLaw[]>([]);
  const [lawFeedback, setLawFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isControlValidated, setIsControlValidated] = useState(false);
  const [requiredMajority, setRequiredMajority] = useState<"simple" | "super">("simple");
  const [superMajorityRatio, setSuperMajorityRatio] = useState<string>("3/5");
  const [vetoMode, setVetoMode] = useState<VetoMode>("none");
  const [isNoConfidenceMotion, setIsNoConfidenceMotion] = useState(false);
  const [useEnclumeLaw, setUseEnclumeLaw] = useState(false);
  const [enclumeStatus, setEnclumeStatus] = useState<EnclumeStatus>("idle");
  const [enclumeStartedAt, setEnclumeStartedAt] = useState<number | null>(null);
  const [enclumeDurationMinutes, setEnclumeDurationMinutes] = useState(4);

  const enclumeDurationMs = useMemo(
    () => enclumeDurationMinutes * 60 * 1000,
    [enclumeDurationMinutes]
  );

  const nextColor = (current: SeatColor, target: "seat" | "president"): SeatColor => {
    const seatCycleNoVeto: SeatColor[] = ["white", "green", "red", "black"];
    const seatCycleWithPlayerVeto: SeatColor[] = ["white", "green", "red", "orange", "black"];

    const presidentCycleNoVeto: SeatColor[] = ["white", "green", "red", "black"];
    const presidentCycleWithPlayerVeto: SeatColor[] = ["white", "green", "red", "orange", "black"];
    const presidentCycleWithPresidentVeto: SeatColor[] = ["white", "green", "orange", "black"];

    // Motion de censure: pas d'orange, uniquement blanc/vert/rouge/noir
    if (isNoConfidenceMotion) {
      const forcedCycle: SeatColor[] = ["white", "green", "red", "black"];
      return forcedCycle[(forcedCycle.indexOf(current) + 1) % forcedCycle.length];
    }

    const cycle =
      target === "seat"
        ? (vetoMode === "player" ? seatCycleWithPlayerVeto : seatCycleNoVeto)
        : (vetoMode === "player"
            ? presidentCycleWithPlayerVeto
            : vetoMode === "president"
              ? presidentCycleWithPresidentVeto
              : presidentCycleNoVeto);

    return cycle[(cycle.indexOf(current) + 1) % cycle.length];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue);
    if (num >= 5 && num <= 35) {
      setNumSeats(num);
      setSeatColors(Array(num).fill("white"));
      setPresidentColor("white");
    } else {
      alert("Entrez un nombre entre 5 et 35");
    }
  };

  const toggleSeat = (index: number) => {
    setSeatColors((prev) => {
      const next = [...prev];
      next[index] = nextColor(next[index], "seat");
      return next;
    });
  };

  const togglePresident = () => setPresidentColor((c) => nextColor(c, "president"));

  const resetVotes = () => {
    if (numSeats === null) return;
    setSeatColors(Array(numSeats).fill("white"));
    setPresidentColor("white");
  };

  const addCurrentLawToPassed = () => {
    const lawTitle = title.trim();
    const lawText = paragraph.trim();

    if (!lawTitle && !lawText) {
      setLawFeedback({
        type: "error",
        message: "Impossible d’ajouter : renseignez au moins un titre ou un texte.",
      });
      return;
    }

    const adoptedUnderEnclume = useEnclumeLaw && enclumeStatus === "adopted";

    setPassedLaws((prev) => [
      {
        title: lawTitle || "Sans titre",
        text: lawText || "Sans texte",
        abrogee: false,
        adopteeSousEnclume: adoptedUnderEnclume,
      },
      ...prev,
    ]);

    setLawFeedback({
      type: "success",
      message: `Loi ajoutée${lawTitle ? ` : ${lawTitle}` : ""}${
        adoptedUnderEnclume ? " (adoptée sous loi de l’Enclume)." : "."
      }`,
    });
  };

  const toggleLawAbrogation = (index: number) => {
    setPassedLaws((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      const current = next[index];
      const nextStatus = !current.abrogee;
      next[index] = { ...current, abrogee: nextStatus };
      setLawFeedback({
        type: "success",
        message: nextStatus
          ? `Loi abrogée${current.title ? ` : ${current.title}` : ""}.`
          : `Loi rétablie${current.title ? ` : ${current.title}` : ""}.`,
      });
      return next;
    });
  };

  const cycleSuperMajorityRatio = () => {
    setSuperMajorityRatio((prev) => {
      const idx = SUPER_MAJORITY_OPTIONS.indexOf(prev as (typeof SUPER_MAJORITY_OPTIONS)[number]);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % SUPER_MAJORITY_OPTIONS.length;
      return SUPER_MAJORITY_OPTIONS[nextIdx];
    });
  };

  const cycleVetoMode = () => {
    setVetoMode((prev) => {
      const idx = VETO_OPTIONS.indexOf(prev);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % VETO_OPTIONS.length;
      return VETO_OPTIONS[nextIdx];
    });
  };

  useEffect(() => {
    if (!lawFeedback) return;
    const t = setTimeout(() => setLawFeedback(null), 2500);
    return () => clearTimeout(t);
  }, [lawFeedback]);

  useEffect(() => {
    if (numSeats === null) return;
    const payload = {
      numSeats,
      title,
      paragraph,
      seatColors,
      presidentColor,
      economyGauge,
      socialGauge,
      securityGauge,
      countrySituation,
      isCrisis,
      crisisDescription,
      provinces,
      passedLaws,
      isControlValidated,
      requiredMajority,
      superMajorityRatio,
      vetoMode,
      isNoConfidenceMotion,
      useEnclumeLaw,
      enclumeStatus,
      enclumeStartedAt,
      enclumeDurationMinutes,
    };

    localStorage.setItem("hemicycleState", JSON.stringify(payload));
    localStorage.setItem("hemicycleNotes", JSON.stringify(passedLaws));
  }, [
    numSeats,
    title,
    paragraph,
    seatColors,
    presidentColor,
    economyGauge,
    socialGauge,
    securityGauge,
    countrySituation,
    isCrisis,
    crisisDescription,
    provinces,
    passedLaws,
    isControlValidated,
    requiredMajority,
    superMajorityRatio,
    vetoMode,
    isNoConfidenceMotion,
    useEnclumeLaw,
    enclumeStatus,
    enclumeStartedAt,
    enclumeDurationMinutes,
  ]);

  useEffect(() => {
    if (useEnclumeLaw) {
      if (!enclumeStartedAt || enclumeStatus === "idle") {
        setEnclumeStartedAt(Date.now());
        setEnclumeStatus("running");
      }
    } else {
      setEnclumeStartedAt(null);
      setEnclumeStatus("idle");
    }
  }, [useEnclumeLaw, enclumeStartedAt, enclumeStatus]);

  useEffect(() => {
    if (!useEnclumeLaw || enclumeStatus !== "running" || !enclumeStartedAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - enclumeStartedAt;
      if (elapsed >= enclumeDurationMs) {
        setEnclumeStatus("adopted");
      }
    }, 250);
    return () => clearInterval(interval);
  }, [useEnclumeLaw, enclumeStatus, enclumeStartedAt, enclumeDurationMs]);

  const canRejectEnclume = useMemo(
    () => useEnclumeLaw && enclumeStatus === "running",
    [useEnclumeLaw, enclumeStatus]
  );

  const canAdoptEnclume = useMemo(
    () => useEnclumeLaw && enclumeStatus === "running",
    [useEnclumeLaw, enclumeStatus]
  );

  // Si la motion de censure est activée, on supprime les oranges déjà posés
  useEffect(() => {
    if (!isNoConfidenceMotion) return;

    setSeatColors((prev) => prev.map((c) => (c === "orange" ? "red" : c)));
    setPresidentColor((prev) => (prev === "orange" ? "red" : prev));
  }, [isNoConfidenceMotion]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Tableau de bord parlementaire
        </h1>

        {numSeats === null ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de sièges :
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min="5"
                  max="35"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Entre 5 et 35"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Créer l'hémicycle
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
              <div className="space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loi :
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Entrez le nom d'une Loi"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Texte de loi :
                  </label>
                  <textarea
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Entrez le texte de loi"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                  Niveau de Contrôle des Provinces
                </h3>

                <div className="space-y-3">
                  {(Object.keys(provinces) as Array<keyof ProvinceState>).map((name) => (
                    <div key={name} className="grid grid-cols-[1fr_140px] gap-2 items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                      <select
                        value={provinces[name]}
                        onChange={(e) =>
                          setProvinces((prev) => ({
                            ...prev,
                            [name]: e.target.value as ProvinceControl,
                          }))
                        }
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {CONTROL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                Pilotage du vote
              </h3>

              <div className="mb-3 text-center">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Avis de la Cour Constitutionnelle
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsControlValidated(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      isControlValidated ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    Loi conforme
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsControlValidated(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      !isControlValidated ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    Loi non-conforme
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type de majorité requis
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => setRequiredMajority("simple")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      requiredMajority === "simple" ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Majorité simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequiredMajority("super")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      requiredMajority === "super" ? "bg-violet-600" : "bg-violet-500 hover:bg-violet-600"
                    }`}
                  >
                    Super majorité
                  </button>
                  <button
                    type="button"
                    onClick={cycleSuperMajorityRatio}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition bg-slate-600 hover:bg-slate-700"
                  >
                    Ratio supermajorité : {superMajorityRatio}
                  </button>
                  <button
                    type="button"
                    onClick={cycleVetoMode}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md text-white transition bg-amber-600 hover:bg-amber-700"
                  >
                    Véto : {vetoMode === "president" ? "Président" : vetoMode === "player" ? "Joueur" : "Aucun"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNoConfidenceMotion((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      isNoConfidenceMotion ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Motion de censure : {isNoConfidenceMotion ? "Activée" : "Désactivée"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseEnclumeLaw((v) => !v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      useEnclumeLaw ? "bg-emerald-700 hover:bg-emerald-800" : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    Utiliser la loi de l&apos;Enclume : {useEnclumeLaw ? "Oui" : "Non"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnclumeStatus("adopted")}
                    disabled={!canAdoptEnclume}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      canAdoptEnclume
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Adopter la loi de l&apos;Enclume
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnclumeStatus("rejected")}
                    disabled={!canRejectEnclume}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      canRejectEnclume
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Rejeter la loi de l&apos;Enclume
                  </button>
                </div>

                <div className="mt-4 max-w-sm mx-auto text-left">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Durée chrono Loi de l&apos;Enclume ({enclumeDurationMinutes} min)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    step={1}
                    value={enclumeDurationMinutes}
                    onChange={(e) => setEnclumeDurationMinutes(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-900">
                <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  Économie ({economyGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={economyGauge}
                  onChange={(e) => setEconomyGauge(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-900">
                <label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                  Social ({socialGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={socialGauge}
                  onChange={(e) => setSocialGauge(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Sécurité ({securityGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={securityGauge}
                  onChange={(e) => setSecurityGauge(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                L'essentiel de l'info :
              </label>
              <textarea
                value={countrySituation}
                onChange={(e) => setCountrySituation(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Décrivez la situation actuelle..."
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isCrisis}
                  onChange={(e) => setIsCrisis(e.target.checked)}
                  className="h-4 w-4"
                />
                Situation de crise
              </label>
            </div>

            {isCrisis && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description de la crise :
                </label>
                <textarea
                  value={crisisDescription}
                  onChange={(e) => setCrisisDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Décrivez la situation de crise..."
                />
              </div>
            )}

            <div className="mb-4 flex justify-end gap-3">
              <button
                onClick={addCurrentLawToPassed}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
              >
                Ajouter la loi aux lois votées
              </button>
              <button
                onClick={resetVotes}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
              >
                Reset tous les sièges
              </button>
              <button
                onClick={() => window.open("/notes", "_blank", "noopener,noreferrer")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                Ouvrir l'historique des lois votées
              </button>
              <button
                onClick={() => window.open("/display", "_blank", "noopener,noreferrer")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                Ouvrir l’affichage plein écran
              </button>
            </div>

            {lawFeedback && (
              <div
                className={`mb-4 rounded-lg border px-4 py-2 text-sm font-medium ${
                  lawFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                    : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
                }`}
              >
                {lawFeedback.message}
              </div>
            )}

            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Lois votées ({passedLaws.length})</h3>
              </div>
              {passedLaws.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Aucune loi enregistrée.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-auto">
                  {passedLaws.map((law, idx) => (
                    <div
                      key={`${law.title}-${idx}`}
                      className={`rounded-lg border p-3 ${
                        law.abrogee
                          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                            {law.title || "Sans titre"}{" "}
                            {law.abrogee ? <span className="text-red-700 dark:text-red-300">(Abrogée)</span> : null}
                          </p>
                          {law.adopteeSousEnclume ? (
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              Adoptée sous loi de l’Enclume
                            </p>
                          ) : null}
                          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                            {law.text || "Sans texte"}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleLawAbrogation(idx)}
                          className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                            law.abrogee
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {law.abrogee ? "Rétablir la loi" : "Abroger la loi"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>



            <Hemicycle
              numSeats={numSeats}
              title={title}
              paragraph={paragraph}
              seatColors={seatColors}
              presidentColor={presidentColor}
              onToggleSeat={toggleSeat}
              onTogglePresident={togglePresident}
              economyGauge={economyGauge}
              socialGauge={socialGauge}
              securityGauge={securityGauge}
              countrySituation={countrySituation}
              isCrisis={isCrisis}
              crisisDescription={crisisDescription}
              provinces={provinces}
              isControlValidated={isControlValidated}
              requiredMajority={requiredMajority}
              superMajorityRatio={superMajorityRatio}
              vetoMode={vetoMode}
              isNoConfidenceMotion={isNoConfidenceMotion}
              useEnclumeLaw={useEnclumeLaw}
              enclumeStatus={enclumeStatus}
              enclumeStartedAt={enclumeStartedAt}
              enclumeDurationMinutes={enclumeDurationMinutes}
            />
            <button
              onClick={() => setNumSeats(null)}
              className="mt-8 mx-auto block px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Modifier le nombre de sièges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
