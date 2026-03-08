"use client";

import { useEffect, useMemo, useState } from "react";
import Hemicycle from "./components/Hemicycle";

type SeatColor = "white" | "green" | "red" | "orange" | "black";
type ProvinceControl =
  | "Sécession"
  | "Autonomie"
  | "Sédition"
  | "Insoumission"
  | "Contestation"
  | "Équilibre"
  | "Stable"
  | "Prospère"
  | "Pacifié"
  | "Contrôle Total";

type RegionalStateControl =
  | "Allié"
  | "Indifférent"
  | "Rivalité"
  | "Antagoniste"
  | "Fantoche"
  | "En Guerre";

type ProvinceState = Record<string, ProvinceControl>;
type RegionalState = Record<string, RegionalStateControl>;

type PassedLaw = {
  title: string;
  text: string;
  abrogee?: boolean;
  adopteeSousEnclume?: boolean;
  organique?: boolean;
};

const PROVINCE_CONTROL_OPTIONS: ProvinceControl[] = [
  "Sécession",
  "Autonomie",
  "Sédition",
  "Insoumission",
  "Contestation",
  "Équilibre",
  "Stable",
  "Prospère",
  "Pacifié",
  "Contrôle Total",
];

const REGIONAL_STATE_OPTIONS: RegionalStateControl[] = [
  "Allié",
  "Indifférent",
  "Rivalité",
  "Antagoniste",
  "Fantoche",
  "En Guerre",
];

const SUPER_MAJORITY_OPTIONS = ["3/5", "2/3", "7/10" ,"3/4"] as const;
const VETO_OPTIONS = ["none", "president", "player"] as const;
type VetoMode = (typeof VETO_OPTIONS)[number];

type EnclumeStatus = "idle" | "running" | "adopted" | "rejected";

type ConstitutionalStatus = "conforme" | "nonConforme" | "nonStatue";

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
  const [budgetGauge, setBudgetGauge] = useState(0);
  const [countrySituation, setCountrySituation] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [crisisDescription, setCrisisDescription] = useState("");
  const [provinces, setProvinces] = useState<ProvinceState>({
    "201D": "Sécession",
    "202D-Plateau": "Stable",
    "202D-Profond": "Stable",
    "204D": "Équilibre",
    "Provinces des Plasticiens": "Contestation",
  });
  const [regionalStates, setRegionalStates] = useState<RegionalState>({
    "Etat de Tori Valu": "Indifférent",
  });
  const [passedLaws, setPassedLaws] = useState<PassedLaw[]>([]);
  const [lawFeedback, setLawFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isControlValidated, setIsControlValidated] = useState<ConstitutionalStatus>("nonStatue");
  const [requiredMajority, setRequiredMajority] = useState<"simple" | "super">("simple");
  const [superMajorityRatio, setSuperMajorityRatio] = useState<string>("3/5");
  const [vetoMode, setVetoMode] = useState<VetoMode>("none");
  const [isNoConfidenceMotion, setIsNoConfidenceMotion] = useState(false);
  const [useEnclumeLaw, setUseEnclumeLaw] = useState(false);
  const [enclumeStatus, setEnclumeStatus] = useState<EnclumeStatus>("idle");
  const [enclumeStartedAt, setEnclumeStartedAt] = useState<number | null>(null);
  const [enclumeDurationMinutes, setEnclumeDurationMinutes] = useState(4);
  const [isSeatSelectionMode, setIsSeatSelectionMode] = useState(false);
  const [selectionRingColor, setSelectionRingColor] = useState("#3b82f6");
  const [selectedSeatOverlays, setSelectedSeatOverlays] = useState<Record<number, string>>({});
  const [selectedPresidentOverlay, setSelectedPresidentOverlay] = useState<string | null>(null);
  const [isEraseMode, setIsEraseMode] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState("");
  const [isGoldOutlineMode, setIsGoldOutlineMode] = useState(false);
  const [goldOutlinedSeats, setGoldOutlinedSeats] = useState<number[]>([]);
  const [goldOutlinedPresident, setGoldOutlinedPresident] = useState(false);
  const [isSecretBallot, setIsSecretBallot] = useState(false);
  const [revealSecretResults, setRevealSecretResults] = useState(false);
  const [proposal1Title, setProposal1Title] = useState("");
  const [proposal1Text, setProposal1Text] = useState("");
  const [proposal2Title, setProposal2Title] = useState("");
  const [proposal2Text, setProposal2Text] = useState("");
  const [proposal3Title, setProposal3Title] = useState("");
  const [proposal3Text, setProposal3Text] = useState("");
  const [proposal1Organic, setProposal1Organic] = useState(false);
  const [proposal2Organic, setProposal2Organic] = useState(false);
  const [proposal3Organic, setProposal3Organic] = useState(false);
  const [electionMode, setElectionMode] = useState(false);
  const [candidateCount, setCandidateCount] = useState(2);
  const [candidateNames, setCandidateNames] = useState<string[]>(["Candidat 1", "Candidat 2"]);
  const [candidateColors, setCandidateColors] = useState<string[]>(["#4f46e5", "#7c3aed"]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);

  const enclumeDurationMs = useMemo(
    () => enclumeDurationMinutes * 60 * 1000,
    [enclumeDurationMinutes]
  );

  useEffect(() => {
    setCandidateNames((prev) => {
      const next = prev.slice(0, candidateCount);
      while (next.length < candidateCount) next.push(`Candidat ${next.length + 1}`);
      return next;
    });
    setCandidateColors((prev) => {
      const palette = ["#4f46e5", "#7c3aed", "#2563eb", "#059669", "#dc2626", "#ea580c", "#0d9488", "#a21caf"];
      const next = prev.slice(0, candidateCount);
      while (next.length < candidateCount) next.push(palette[next.length % palette.length]);
      return next;
    });
    setActiveCandidateIndex((prev) => Math.min(prev, Math.max(0, candidateCount - 1)));
  }, [candidateCount]);

  const setCandidateName = (idx: number, value: string) => {
    setCandidateNames((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const setCandidateColor = (idx: number, value: string) => {
    setCandidateColors((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const nextColor = (current: SeatColor, target: "seat" | "president"): SeatColor => {
    if (electionMode) {
      const active = candidateColors[activeCandidateIndex] ?? candidateColors[0] ?? "#4f46e5";
      const currentNorm = current.toLowerCase();
      return currentNorm === active.toLowerCase() ? "white" : (active as SeatColor);
    }

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

  const canEnableSelectionMode = useMemo(() => !isEraseMode, [isEraseMode]);
  const canEnableEraseMode = useMemo(() => !isSeatSelectionMode, [isSeatSelectionMode]);

  const toggleSelectionMode = () => {
    setIsSeatSelectionMode((prev) => {
      const next = !prev;
      if (next) setIsEraseMode(false);
      return next;
    });
  };

  const toggleEraseMode = () => {
    setIsEraseMode((prev) => {
      const next = !prev;
      if (next) setIsSeatSelectionMode(false);
      return next;
    });
  };

  const toggleSeat = (index: number) => {
    if (isGoldOutlineMode) {
      setGoldOutlinedSeats((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
      return;
    }

    if (isSeatSelectionMode && !isEraseMode) {
      setSelectedSeatOverlays((prev) => {
        const next = { ...prev };
        if (next[index]) delete next[index];
        else next[index] = selectionRingColor;
        return next;
      });
      return;
    }

    if (isEraseMode && !isSeatSelectionMode) {
      setSeatColors((prev) => {
        const next = [...prev];
        next[index] = "white";
        return next;
      });
      return;
    }

    setSeatColors((prev) => {
      const next = [...prev];
      next[index] = nextColor(next[index], "seat");
      return next;
    });
  };

  const togglePresident = () => {
    if (isGoldOutlineMode) {
      setGoldOutlinedPresident((prev) => !prev);
      return;
    }

    if (isSeatSelectionMode && !isEraseMode) {
      setSelectedPresidentOverlay((prev) => (prev ? null : selectionRingColor));
      return;
    }

    if (isEraseMode && !isSeatSelectionMode) {
      setPresidentColor("white");
      return;
    }

    setPresidentColor((c) => nextColor(c, "president"));
  };

  // Reset uniquement les voix (couleurs de vote)
  const resetVotes = () => {
    if (numSeats === null) return;
    setSeatColors(Array(numSeats).fill("white"));
    setPresidentColor("white");
  };

  // Reset uniquement les cercles de sélection (annotations)
  const resetSelections = () => {
    setSelectedSeatOverlays({});
    setSelectedPresidentOverlay(null);
    setGoldOutlinedSeats([]);
    setGoldOutlinedPresident(false);
  };

  const canSaveLaw = useMemo(() => {
    if (isControlValidated === "conforme" || isControlValidated === "nonStatue") return true;
    return useEnclumeLaw && enclumeStatus === "adopted";
  }, [isControlValidated, useEnclumeLaw, enclumeStatus]);

  const addCurrentLawToPassed = () => {
    const lawTitle = title.trim();
    const lawText = paragraph.trim();

    if (!canSaveLaw) {
      setLawFeedback({
        type: "error",
        message:
          "Impossible d’adopter : loi non validée par la Cour constitutionnelle (sauf loi de l’Enclume adoptée).",
      });
      return;
    }

    if (!lawTitle && !lawText) {
      setLawFeedback({
        type: "error",
        message: "Impossible d’adopter : renseignez au moins un nom de loi ou un texte de loi.",
      });
      return;
    }

    const adoptedUnderEnclume = useEnclumeLaw && enclumeStatus === "adopted";
    const isOrganicLaw = requiredMajority === "super";

    setPassedLaws((prev) => [
      {
        title: lawTitle || "Sans titre",
        text: lawText || "Sans texte",
        abrogee: false,
        adopteeSousEnclume: adoptedUnderEnclume,
        organique: isOrganicLaw,
      },
      ...prev,
    ]);

    setLawFeedback({
      type: "success",
      message: `Loi ajoutée${lawTitle ? ` : ${lawTitle}` : ""}${
        adoptedUnderEnclume
          ? " (Adoptée sous loi de l’Enclume)."
          : isOrganicLaw
          ? " (Loi Organique)."
          : "."
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
      budgetGauge,
      countrySituation,
      isCrisis,
      crisisDescription,
      provinces,
      regionalStates,
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
      selectedSeatOverlays,
      selectedPresidentOverlay,
      goldOutlinedSeats,
      goldOutlinedPresident,
      isEraseMode,
      isSecretBallot,
      revealSecretResults,
      electionMode,
      candidateCount,
      candidateNames,
      candidateColors,
      activeCandidateIndex,
      proposals: [
        { title: proposal1Title, text: proposal1Text, organique: proposal1Organic },
        { title: proposal2Title, text: proposal2Text, organique: proposal2Organic },
        { title: proposal3Title, text: proposal3Text, organique: proposal3Organic },
      ],
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
    budgetGauge,
    countrySituation,
    isCrisis,
    crisisDescription,
    provinces,
    regionalStates,
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
    selectedSeatOverlays,
    selectedPresidentOverlay,
    goldOutlinedSeats,
    goldOutlinedPresident,
    isEraseMode,
    isSecretBallot,
    revealSecretResults,
    electionMode,
    candidateCount,
    candidateNames,
    candidateColors,
    activeCandidateIndex,
    proposal1Title,
    proposal1Text,
    proposal2Title,
    proposal2Text,
    proposal3Title,
    proposal3Text,
    proposal1Organic,
    proposal2Organic,
    proposal3Organic,
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

  const addProvince = () => {
    const name = newProvinceName.trim();
    if (!name) return;
    setProvinces((prev) => {
      if (prev[name] || regionalStates[name]) return prev;
      return { ...prev, [name]: "Sécession" };
    });
    setNewProvinceName("");
  };

  const removeProvince = (name: string) => {
    setProvinces((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const setProvinceIndependence = (name: string) => {
    setProvinces((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setRegionalStates((prev) => ({ ...prev, [name]: "Indifférent" }));
  };

  const annexRegionalState = (name: string) => {
    setRegionalStates((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setProvinces((prev) => ({ ...prev, [name]: "Sécession" }));
  };

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

                {/* déplacé : niveau des provinces sous Loi/Texte */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                    Niveau de Contrôle des Provinces
                  </h3>

                  <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      value={newProvinceName}
                      onChange={(e) => setNewProvinceName(e.target.value)}
                      className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ajouter une province..."
                    />
                    <button
                      type="button"
                      onClick={addProvince}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(Object.keys(provinces) as string[]).map((name) => (
                      <div key={name} className="grid grid-cols-[1fr_140px_auto_auto] gap-2 items-center">
                        <input
                          type="text"
                          defaultValue={name}
                          onBlur={(e) => renameProvince(name, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              renameProvince(name, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="min-w-0 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          title="Modifier le nom de la province"
                        />
                        <select
                          value={provinces[name]}
                          onChange={(e) =>
                            setProvinces((prev) => ({ ...prev, [name]: e.target.value as ProvinceControl }))
                          }
                          className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {PROVINCE_CONTROL_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setProvinceIndependence(name)}
                          className="px-2 py-1.5 text-xs font-semibold rounded-md text-white bg-amber-600 hover:bg-amber-700 transition"
                        >
                          Indépendance
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProvince(name)}
                          className="px-2 py-1.5 text-xs font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* déplacé : généralités dans la colonne de droite */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                  Généralités Régionales
                </h3>
                <div className="space-y-3">
                  {(Object.keys(regionalStates) as string[]).map((name) => (
                    <div key={name} className="grid grid-cols-[1fr_140px_auto] gap-2 items-center">
                      <span className="min-w-0 px-2 py-1.5 text-sm text-gray-900 dark:text-white">{name}</span>
                      <select
                        value={regionalStates[name]}
                        onChange={(e) =>
                          setRegionalStates((prev) => ({ ...prev, [name]: e.target.value as RegionalStateControl }))
                        }
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {REGIONAL_STATE_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => annexRegionalState(name)}
                        className="px-2 py-1.5 text-xs font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                      >
                        Annexion
                      </button>
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
                    onClick={() => setIsControlValidated("conforme")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      isControlValidated === "conforme" ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    Loi conforme
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsControlValidated("nonConforme")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      isControlValidated === "nonConforme" ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    Loi non-conforme
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsControlValidated("nonStatue")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                      isControlValidated === "nonStatue" ? "bg-gray-600" : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Cour n&apos;a pas statué
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

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Budget ({budgetGauge > 0 ? `+${budgetGauge}` : budgetGauge})
                </label>
                <input
                  type="range"
                  min={-3}
                  max={3}
                  step={1}
                  value={budgetGauge}
                  onChange={(e) => setBudgetGauge(Number(e.target.value))}
                  className="w-full accent-slate-500"
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

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Proposition de loi 1
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={proposal1Title}
                    onChange={(e) => setProposal1Title(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Titre de la proposition"
                  />
                  <textarea
                    value={proposal1Text}
                    onChange={(e) => setProposal1Text(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Texte de la proposition"
                  />
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={proposal1Organic}
                      onChange={(e) => setProposal1Organic(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Loi organique
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Proposition de loi 2
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={proposal2Title}
                    onChange={(e) => setProposal2Title(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Titre de la proposition"
                  />
                  <textarea
                    value={proposal2Text}
                    onChange={(e) => setProposal2Text(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Texte de la proposition"
                  />
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={proposal2Organic}
                      onChange={(e) => setProposal2Organic(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Loi organique
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Proposition de loi 3
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={proposal3Title}
                    onChange={(e) => setProposal3Title(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Titre de la proposition"
                  />
                  <textarea
                    value={proposal3Text}
                    onChange={(e) => setProposal3Text(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Texte de la proposition"
                  />
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={proposal3Organic}
                      onChange={(e) => setProposal3Organic(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Loi organique
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4 flex justify-end gap-3">
              <button
                onClick={addCurrentLawToPassed}
                disabled={!canSaveLaw}
                className={`px-4 py-2 text-white font-semibold rounded-lg transition ${
                  canSaveLaw
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                title={
                  canSaveLaw
                    ? "Adopter la loi"
                    : "Loi non conforme à la Constitution (sauf Enclume adoptée)"
                }
              >
                Adopter la loi
              </button>

              <div className="flex flex-col gap-2">
                <label className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Couleur Parti</span>
                  <input
                    type="color"
                    value={selectionRingColor}
                    onChange={(e) => setSelectionRingColor(e.target.value)}
                    className="h-6 w-10 cursor-pointer"
                  />
                </label>
                <button
                  onClick={() => setIsGoldOutlineMode((v) => !v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                    isGoldOutlineMode ? "bg-amber-700 hover:bg-amber-800" : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  Président de Parti : {isGoldOutlineMode ? "ON" : "OFF"}
                </button>
              </div>

              {/* Boutons superposés et compacts */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={toggleSelectionMode}
                  disabled={!canEnableSelectionMode && !isSeatSelectionMode}
                  className={`px-2.5 py-1.5 text-xs text-white font-semibold rounded-md transition ${
                    isSeatSelectionMode
                      ? "bg-blue-700 hover:bg-blue-800"
                      : !canEnableSelectionMode
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSeatSelectionMode ? "Mode sélection: ON" : "Mode sélection: OFF"}
                </button>

                <button
                  onClick={toggleEraseMode}
                  disabled={!canEnableEraseMode && !isEraseMode}
                  className={`px-2.5 py-1.5 text-xs text-white font-semibold rounded-md transition ${
                    isEraseMode
                      ? "bg-rose-700 hover:bg-rose-800"
                      : !canEnableEraseMode
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isEraseMode ? "Mode effacement: ON" : "Mode effacement: OFF"}
                </button>

                <button
                  onClick={resetVotes}
                 className="px-2.5 py-1.5 text-xs bg-violet-700 hover:bg-violet-800 text-white font-semibold rounded-md transition"
                >
                  Reset des voix
                </button>

                <button
                  onClick={resetSelections}
                  className="px-2.5 py-1.5 text-xs bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md transition"
                >
                  Reset des partis politiques
                </button>
              </div>

              <div className="flex flex-col gap-2">
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
                <button
                  onClick={() => window.open("/propositions", "_blank", "noopener,noreferrer")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                >
                  Ouvrir les 3 propositions
                </button>
                <button
                  onClick={() =>
                    setIsSecretBallot((v) => {
                      const next = !v;
                      if (!next) setRevealSecretResults(false);
                      return next;
                    })
                  }
                  className={`px-4 py-2 text-white font-semibold rounded-lg transition ${
                    isSecretBallot ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isSecretBallot ? "Désactiver le bulletin secret" : "Activer le bulletin secret"}
                </button>

                {isSecretBallot && (
                  <button
                    onClick={() => setRevealSecretResults((v) => !v)}
                    className={`px-4 py-2 text-white font-semibold rounded-lg transition ${
                      revealSecretResults
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {revealSecretResults ? "Masquer les résultats" : "Afficher les résultats"}
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                Mode élection
              </h3>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                <button
                  type="button"
                  onClick={() => setElectionMode((v) => !v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition ${
                    electionMode ? "bg-indigo-700 hover:bg-indigo-800" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {electionMode ? "Désactiver l'élection" : "Activer l'élection"}
                </button>

                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nombre de candidats ({candidateCount})
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={candidateCount}
                  onChange={(e) => setCandidateCount(Number(e.target.value))}
                  className="w-40 accent-indigo-500"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {candidateNames.slice(0, candidateCount).map((name, idx) => (
                  <div key={`cand-wrap-${idx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setCandidateName(idx, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={`Candidat ${idx + 1}`}
                    />
                    <input
                      type="color"
                      value={candidateColors[idx] ?? "#4f46e5"}
                      onChange={(e) => setCandidateColor(idx, e.target.value)}
                      className="h-9 w-11 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      title={`Couleur candidat ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>

              {electionMode && (
                <div className="mt-3 max-w-sm mx-auto">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 text-center">
                    Candidat actif pour le clic
                  </label>
                  <select
                    value={activeCandidateIndex}
                    onChange={(e) => setActiveCandidateIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {candidateNames.slice(0, candidateCount).map((name, idx) => (
                      <option key={`active-cand-${idx}`} value={idx}>
                        {name?.trim() || `Candidat ${idx + 1}`}
                      </option>
                    ))}
                  </select>
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
              budgetGauge={budgetGauge}
              countrySituation={countrySituation}
              isCrisis={isCrisis}
              crisisDescription={crisisDescription}
              provinces={provinces}
              regionalStates={regionalStates}
              isControlValidated={isControlValidated}
              requiredMajority={requiredMajority}
              superMajorityRatio={superMajorityRatio}
              vetoMode={vetoMode}
              isNoConfidenceMotion={isNoConfidenceMotion}
              useEnclumeLaw={useEnclumeLaw}
              enclumeStatus={enclumeStatus}
              enclumeStartedAt={enclumeStartedAt}
              enclumeDurationMinutes={enclumeDurationMinutes}
              selectedSeatOverlays={selectedSeatOverlays}
              selectedPresidentOverlay={selectedPresidentOverlay}
              goldOutlinedSeats={goldOutlinedSeats}
              goldOutlinedPresident={goldOutlinedPresident}
              isSecretBallot={isSecretBallot}
              hideAssemblyWhenSecretBallot={false}
              revealSecretResults={revealSecretResults}
              electionMode={electionMode}
              candidateNames={candidateNames.slice(0, candidateCount)}
              candidateColors={candidateColors.slice(0, candidateCount)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
