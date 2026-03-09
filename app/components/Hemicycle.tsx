"use client";

import { useEffect, useMemo, useState } from "react";

type SeatColor = "white" | "green" | "red" | "orange" | "black" | string;
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
  | "Zone de Non-Droit"
  | "Contrôle Total"
  | "Insurrection"
  | "Défiance"
  | "Rayonnante";

type RegionalStateControl =
  | "En Guerre"
  | "Antagoniste"
  | "Rival"
  | "Prudent"
  | "Indifférent"
  | "Coopératif"
  | "Allié"
  | "Fantoche";

type ProvinceState = Record<string, ProvinceControl>;
type RegionalState = Record<string, RegionalStateControl>;

type EnclumeStatus = "idle" | "running" | "adopted" | "rejected";

type PassedLaw = {
  title: string;
  text: string;
  abrogee?: boolean;
  adopteeSousEnclume?: boolean;
  organique?: boolean;
  nonConforme?: boolean;
  decret?: boolean;
};

interface HemicycleProps {
  numSeats: number;
  title: string;
  paragraph: string;
  seatColors: SeatColor[];
  presidentColor: SeatColor;
  onToggleSeat: (index: number) => void;
  onTogglePresident: () => void;
  svgOnly?: boolean;
  readOnly?: boolean;
  economyGauge?: number;
  socialGauge?: number;
  securityGauge?: number;
  budgetGauge?: number;
  countrySituation?: string;
  isCrisis?: boolean;
  crisisDescription?: string;
  provinces?: ProvinceState;
  regionalStates?: RegionalState;
  isControlValidated?: "conforme" | "nonConforme" | "nonStatue";
  requiredMajority?: "simple" | "super";
  superMajorityRatio?: string;
  isDecretMode?: boolean;
  vetoMode?: "none" | "president" | "player";
  isNoConfidenceMotion?: boolean;
  useEnclumeLaw?: boolean;
  enclumeStatus?: EnclumeStatus;
  enclumeStartedAt?: number | null;
  enclumeDurationMinutes?: number;
  selectedSeatOverlays?: Record<number, string>;
  selectedPresidentOverlay?: string | null;
  goldOutlinedSeats?: number[];
  goldOutlinedPresident?: boolean;
  isSecretBallot?: boolean;
  hideAssemblyWhenSecretBallot?: boolean;
  revealSecretResults?: boolean;
  electionMode?: boolean;
  candidateNames?: string[];
  candidateColors?: string[];
  passedLaws?: PassedLaw[];
  onToggleLawAbrogation?: (index: number) => void;
}

export default function Hemicycle({
  numSeats,
  title,
  paragraph,
  seatColors,
  presidentColor,
  onToggleSeat,
  onTogglePresident,
  svgOnly = false,
  readOnly = false,
  economyGauge = 0,
  socialGauge = 0,
  securityGauge = 0,
  budgetGauge = 0,
  countrySituation = "",
  isCrisis = false,
  crisisDescription = "",
  provinces = {
    "La Capitale": "Prospère",
    "Le Plateau": "Équilibre",
    "Les Hauteurs Profondes": "Stable",
    "Vallée de l’Armoire": "Contestation",
    "Provinces des Plasticiens": "Contestation",
    "Archipel des Eldrazi": "Autonomie",
  },
  regionalStates = {
    "L’Outre-Porte": "Prudent",
    "Alliance des Etats d'Elimat": "Indifférent",
    "Etat de Tori Value": "Rival",
    "Junte des Emirats du Sud": "Coopératif",
  },
  isControlValidated = "nonConforme",
  requiredMajority = "simple",
  superMajorityRatio = "3/5",
  isDecretMode = false,
  vetoMode = "none",
  isNoConfidenceMotion = false,
  useEnclumeLaw = false,
  enclumeStatus = "idle",
  enclumeStartedAt = null,
  enclumeDurationMinutes = 4,
  selectedSeatOverlays = {},
  selectedPresidentOverlay = null,
  goldOutlinedSeats = [],
  goldOutlinedPresident = false,
  isSecretBallot = false,
  hideAssemblyWhenSecretBallot = true,
  revealSecretResults = false,
  electionMode = false,
  candidateNames = ["Candidat 1"],
  candidateColors = ["#4f46e5"],
  passedLaws = [],
  onToggleLawAbrogation,
}: HemicycleProps) {
  const [now, setNow] = useState<number>(Date.now());
  const enclumeDurationMs = enclumeDurationMinutes * 60 * 1000;

  useEffect(() => {
    if (!useEnclumeLaw || enclumeStatus !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [useEnclumeLaw, enclumeStatus]);

  const counts = useMemo(() => {
    const all = [...seatColors, presidentColor];
    const registered = all.filter((c) => c !== "black"); // inscrits effectifs
    return {
      white: registered.filter((c) => c === "white").length,
      green: registered.filter((c) => c === "green").length,
      red: registered.filter((c) => c === "red").length,
      orange: registered.filter((c) => c === "orange").length,
      black: all.filter((c) => c === "black").length,
      // Les vétos (orange) comptent comme contre
      against: registered.filter((c) => c === "red" || c === "orange").length,
    };
  }, [seatColors, presidentColor]);

  const superThreshold = useMemo(() => {
    const [numStr, denStr] = superMajorityRatio.split("/");
    const num = Number(numStr);
    const den = Number(denStr);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return 3 / 5;
    return num / den;
  }, [superMajorityRatio]);

  const enclumeRemaining = useMemo(() => {
    if (!enclumeStartedAt) return enclumeDurationMs;
    return Math.max(0, enclumeDurationMs - (now - enclumeStartedAt));
  }, [enclumeStartedAt, now, enclumeDurationMs]);

  const enclumeTimerLabel = useMemo(() => {
    const totalSec = Math.ceil(enclumeRemaining / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [enclumeRemaining]);

  const majorityStatus = useMemo(() => {
    const all = [...seatColors, presidentColor];
    const registered = all.filter((c) => c !== "black");
    const hasSeatVeto = registered.some((c) => c === "orange");
    const hasPresidentVeto = presidentColor === "orange";

    const pour = registered.filter((c) => c === "green").length;
    const contre = registered.filter((c) => c === "red" || c === "orange").length;
    const exprimes = pour + contre;

    if (isDecretMode && !isNoConfidenceMotion && !useEnclumeLaw) {
      // Nouveau : droit de véto contre un décret
      const decretVetoUsed =
        (vetoMode === "player" && hasSeatVeto) ||
        (vetoMode === "president" && hasPresidentVeto);

      if (decretVetoUsed) {
        return {
          label:
            vetoMode === "president"
              ? "Décret bloqué : droit de véto du Président utilisé"
              : "Décret bloqué : droit de véto utilisé",
          tone: "text-rose-700 dark:text-rose-300",
          bg: "bg-rose-50 dark:bg-rose-950",
        };
      }

      if (exprimes === 0) {
        return {
          label: `Décret en cours — nécessite ${superMajorityRatio} des votes contre pour être bloqué`,
          tone: "text-amber-700 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-amber-950",
        };
      }
      const ratioContre = contre / exprimes;
      if (ratioContre >= superThreshold) {
        return {
          label: `Décret rejeté (Super Majorité contre atteinte : ${superMajorityRatio})`,
          tone: "text-rose-700 dark:text-rose-300",
          bg: "bg-rose-50 dark:bg-rose-950",
        };
      }
      return {
        label: `Décret adopté (contre < ${superMajorityRatio})`,
        tone: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      };
    }

    if (useEnclumeLaw && !isNoConfidenceMotion) {
      if (enclumeStatus === "adopted") {
        return {
          label: "Loi de l’Enclume adoptée",
          tone: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-950",
        };
      }
      if (enclumeStatus === "rejected") {
        return {
          label: "Loi de l’Enclume rejetée",
          tone: "text-rose-700 dark:text-rose-300",
          bg: "bg-rose-50 dark:bg-rose-950",
        };
      }
      return {
        label: "Loi de l’Enclume en cours (chronomètre actif)",
        tone: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-emerald-950",
      };
    }

    if (isNoConfidenceMotion) {
      const inscrits = registered.length;
      const seuilAbsolu = Math.floor(inscrits / 2) + 1;
      const allExpressed = registered.every((c) => c !== "white");

      if (!allExpressed) {
        return {
          label: "Vote en cours",
          tone: "text-amber-700 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-emerald-950",
        };
      }

      if (pour >= seuilAbsolu) {
        return {
          label: "Motion de censure adoptée",
          tone: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-950",
        };
      }

      return {
        label: "Motion de censure rejetée",
        tone: "text-rose-700 dark:text-rose-300",
        bg: "bg-rose-50 dark:bg-rose-950",
      };
    }

    if (hasSeatVeto) {
      return {
        label:
          presidentColor === "orange"
            ? "Droit de véto du Président utilisé"
            : "Un droit de véto a été utilisé par un parlementaire",
        tone: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-emerald-950",
      };
    }

    // Véto joueur : si activé, le résultat indique le véto utilisé
    if (vetoMode === "player" && exprimes > 0 && hasSeatVeto) {
      return {
        label: "Un droit de véto a été utilisé",
        tone: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-emerald-950",
      };
    }

    if (exprimes === 0) {
      return {
        label: "Aucune majorité",
        tone: "text-gray-700 dark:text-gray-200",
        bg: "bg-rose-50 dark:bg-rose-950",
      };
    }

    const ratioPour = pour / exprimes;

    if (ratioPour >= superThreshold) {
      return {
        label: `Super Majorité (${superMajorityRatio})`,
        tone: "text-emerald-700 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      };
    }

    if (ratioPour > 0.5) {
      return {
        label: "Majorité simple (50% + 1 voix)",
        tone: "text-blue-700 dark:text-blue-300",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      };
    }

    if (ratioPour === 0.5) {
      if (presidentColor === "green") {
        return {
          label: "Majorité simple (voix prépondérante du Président)",
          tone: "text-blue-700 dark:text-blue-300",
          bg: "bg-emerald-50 dark:bg-emerald-950",
        };
      }
      return {
        label: "Aucune majorité",
        tone: "text-gray-700 dark:text-gray-200",
        bg: "bg-rose-50 dark:bg-rose-950",
      };
    }

    return {
      label: "Aucune majorité",
      tone: "text-gray-700 dark:text-gray-200",
      bg: "bg-rose-50 dark:bg-rose-950",
    };
  }, [
    seatColors,
    presidentColor,
    superThreshold,
    superMajorityRatio,
    vetoMode,
    isNoConfidenceMotion,
    useEnclumeLaw,
    enclumeStatus,
    isDecretMode,
  ]);

  const seats = useMemo(() => {
    const rows = numSeats < 12 ? 3 : numSeats > 50 ? 7 : numSeats > 35 ? 6 : numSeats > 21 ? 5 : 4;
    const rowRadii =
      rows === 3
        ? [160, 188, 216]
        : rows === 4
        ? [152, 178, 204, 230]
        : rows === 5
        ? [144, 168, 192, 216, 240]
        : rows === 6
        ? [136, 158, 180, 202, 224, 246]
        : [128, 148, 168, 188, 208, 228, 248];

    const baseWeights =
      rows === 3
        ? [2, 3, 4]
        : rows === 4
        ? [2, 3, 4, 5]
        : rows === 5
        ? [2, 3, 4, 5, 6]
        : rows === 6
        ? [2, 3, 4, 5, 6, 7]
        : [2, 3, 4, 5, 6, 7, 8];

    const weightSum = baseWeights.reduce((a, b) => a + b, 0);
    const capacities = baseWeights.map((w) => Math.max(1, Math.floor((numSeats * w) / weightSum)));
    let allocated = capacities.reduce((a, b) => a + b, 0);
    let cursor = capacities.length - 1;
    while (allocated < numSeats) {
      capacities[cursor]++;
      allocated++;
      cursor = (cursor - 1 + capacities.length) % capacities.length;
    }
    while (allocated > numSeats) {
      const idx = capacities.findIndex((c) => c > 1);
      if (idx === -1) break;
      capacities[idx]--;
      allocated--;
    }

    let index = 0;
    const result: Array<{ index: number; x: number; y: number; color: SeatColor }> = [];

    for (let r = 0; r < rows; r++) {
      const count = capacities[r];
      const edgeInsetDeg = count <= 2 ? 12 : count <= 4 ? 9 : 6;
      const startDeg = 140 - edgeInsetDeg;
      const endDeg = 40 + edgeInsetDeg;
      const start = (startDeg * Math.PI) / 180;
      const end = (endDeg * Math.PI) / 180;

      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = start - t * (start - end);
        const radius = rowRadii[r];
        const x = 250 + radius * Math.cos(angle);
        const baseY = 292 - radius * Math.sin(angle);
        const centerProximity = 1 - Math.abs(t - 0.5) * 2;
        const centerDrop = 18 * centerProximity;
        const y = baseY + centerDrop;
        result.push({ index, x, y, color: seatColors[index] });
        index++;
      }
    }

    return result;
  }, [numSeats, seatColors]);

  const presidentY = useMemo(() => {
    const rows = numSeats < 12 ? 3 : numSeats > 50 ? 7 : numSeats > 35 ? 6 : numSeats > 21 ? 5 : 4;
    const rowRadii =
      rows === 3
        ? [160, 188, 216]
        : rows === 4
        ? [152, 178, 204, 230]
        : rows === 5
        ? [144, 168, 192, 216, 240]
        : rows === 6
        ? [136, 158, 180, 202, 224, 246]
        : [128, 148, 168, 188, 208, 228, 248];

    const rowCenterYs = rowRadii.map((radius) => (292 - radius) + 18);
    const sorted = [...rowCenterYs].sort((a, b) => a - b);
    const deltas: number[] = [];
    for (let i = 1; i < sorted.length; i++) deltas.push(sorted[i] - sorted[i - 1]);
    const avgRowGap = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 28;
    const hemicycleBottomY = Math.max(...rowCenterYs);
    return hemicycleBottomY + 1.5 * avgRowGap;
  }, [numSeats]);

  const colorMap: Record<SeatColor, { fill: string; stroke: string }> = {
    white: { fill: "#ffffff", stroke: "#9ca3af" },
    green: { fill: "#22c55e", stroke: "#15803d" },
    red: { fill: "#ef4444", stroke: "#b91c1c" },
    orange: { fill: "#f59e0b", stroke: "#b45309" },
    black: { fill: "#111827", stroke: "#000000" },
  };

  const resolveSeatVisual = (color: SeatColor): { fill: string; stroke: string } => {
    const mapped = colorMap[color];
    if (mapped) return mapped;
    // Fallback pour couleurs dynamiques (mode élection : hex, rgb, etc.)
    return { fill: color, stroke: "#111827" };
  };

  const presidentBorder = {
    stroke: "#d4af37",
    strokeWidth: 3,
  };

  const overlayGroups = useMemo(() => {
    const grouped = new Map<string, Array<{ x: number; y: number; r: number }>>();

    seats.forEach((seat) => {
      const color = selectedSeatOverlays[seat.index];
      if (!color) return;
      if (!grouped.has(color)) grouped.set(color, []);
      grouped.get(color)!.push({ x: seat.x, y: seat.y, r: 15 });
    });

    if (selectedPresidentOverlay) {
      if (!grouped.has(selectedPresidentOverlay)) grouped.set(selectedPresidentOverlay, []);
      grouped.get(selectedPresidentOverlay)!.push({ x: 250, y: presidentY, r: 16 });
    }

    return Array.from(grouped.entries()).map(([color, points], idx) => ({
      id: `overlay-blob-${idx}`,
      color,
      points,
    }));
  }, [seats, selectedSeatOverlays, selectedPresidentOverlay, presidentY]);

  const goldSeatSet = useMemo(() => new Set(goldOutlinedSeats), [goldOutlinedSeats]);

  const svgBlock = (
    <svg
      viewBox="0 0 500 360"
      className="w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
    >
      <defs>
        {overlayGroups.map((g) => (
          <filter key={g.id} id={g.id} x="-40%" y="-40%" width="180%" height="180%">
            <feMorphology in="SourceGraphic" operator="dilate" radius="1" result="dilated" />
            <feGaussianBlur in="dilated" stdDeviation="4.5" result="blurred" />
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 28 -10
              "
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        ))}
      </defs>

      <g transform="translate(250 220) scale(1.12) translate(-250 -220)">
        <path d="M 100 176 A 196 196 0 0 1 400 176" fill="none" stroke="#ccc" strokeWidth="2" className="dark:stroke-gray-600" />

        {overlayGroups.map((g) => (
          <g
            key={g.id}
            filter={`url(#${g.id})`}
            style={{ mixBlendMode: "lighten" }}
            opacity={0.5}
            pointerEvents="none"
          >
            {/* base fill pour éviter les trous */}
            {g.points.map((p, i) => (
              <circle key={`${g.id}-base-${i}`} cx={p.x} cy={p.y} r={p.r + 6} fill={g.color} />
            ))}
            {/* couche fusionnée */}
            {g.points.map((p, i) => (
              <circle key={`${g.id}-${i}`} cx={p.x} cy={p.y} r={p.r} fill={g.color} />
            ))}
          </g>
        ))}

        {seats.map((seat) => {
          const seatVisual = resolveSeatVisual(seat.color);
          return (
            <g key={seat.index}>
              <circle
                cx={seat.x}
                cy={seat.y}
                r="12"
                fill={seatVisual.fill}
                stroke={goldSeatSet.has(seat.index) ? "#d4af37" : seatVisual.stroke}
                strokeWidth={goldSeatSet.has(seat.index) ? "3" : "2"}
                className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
                onClick={svgOnly || readOnly ? undefined : () => onToggleSeat(seat.index)}
                title={`Siège ${seat.index + 1}`}
              />
            </g>
          );
        })}

        {(() => {
          const presidentVisual = resolveSeatVisual(presidentColor);
          return (
            <circle
              cx="250"
              cy={presidentY}
              r="13"
              fill={presidentVisual.fill}
              stroke={goldOutlinedPresident ? "#d4af37" : presidentBorder.stroke}
              strokeWidth={goldOutlinedPresident ? 3 : presidentBorder.strokeWidth}
              className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={svgOnly || readOnly ? undefined : onTogglePresident}
            />
          );
        })()}

        <text x="250" y={presidentY + 32} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200 text-xs">
          Président
        </text>
        {isSecretBallot && !hideAssemblyWhenSecretBallot ? (
          <text
            x="250"
            y={presidentY + 48}
            textAnchor="middle"
            className="fill-gray-700 dark:fill-gray-200 text-[10px] font-semibold"
          >
            Vote à bulletin secret
          </text>
        ) : null}
      </g>
    </svg>
  );

  const hemicycleOrSecretBlock = isSecretBallot && hideAssemblyWhenSecretBallot ? (
    <div className="w-full aspect-[500/360] border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Vote à bulletin secret</p>
      </div>
    </div>
  ) : (
    svgBlock
  );

  if (svgOnly) return <div className="w-screen h-screen flex items-center justify-center bg-black">{hemicycleOrSecretBlock}</div>;

  const clampedBudget = Math.max(-7, Math.min(7, budgetGauge));
  const negativeBoxes = Math.max(0, -clampedBudget);
  const positiveBoxes = Math.max(0, clampedBudget);

  const normalizedCandidates = useMemo(() => {
    const base = candidateNames.slice(0, 8).map((n, i) => (n?.trim() ? n.trim() : `Candidat ${i + 1}`));
    return base.length > 0 ? base : ["Candidat 1"];
  }, [candidateNames]);

  const normalizedCandidateColors = useMemo(() => {
    const palette = ["#4f46e5", "#7c3aed", "#2563eb", "#059669", "#dc2626", "#ea580c", "#0d9488", "#a21caf"];
    const count = normalizedCandidates.length;
    const base = candidateColors.slice(0, count);
    while (base.length < count) base.push(palette[base.length % palette.length]);
    return base;
  }, [candidateColors, normalizedCandidates]);

  const electionResults = useMemo(() => {
    const all = [...seatColors, presidentColor].filter((c) => c !== "white" && c !== "black");
    return normalizedCandidates.map((name, i) => {
      const color = (normalizedCandidateColors[i] ?? "").toLowerCase();
      const votes = all.filter((c) => c.toLowerCase() === color).length;
      return { name, color: normalizedCandidateColors[i], votes };
    });
  }, [seatColors, presidentColor, normalizedCandidates, normalizedCandidateColors]);

  const isSecretCounting = isSecretBallot && !revealSecretResults;

  const canManageLawsFromHere = Boolean(onToggleLawAbrogation);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full overflow-x-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start min-w-[980px]">
          {/* Colonne gauche : Situation + Essentiel + (Avis/Enclume/Motion/Proposition) */}
          <div className="space-y-4">
            <div
              className={`rounded-lg p-4 border ${
                isCrisis
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
              }`}
            >
              <h3
                className={`text-sm font-semibold mb-2 ${
                  isCrisis
                    ? "text-red-800 dark:text-red-200"
                    : "text-blue-800 dark:text-blue-200"
                }`}
              >
                {isCrisis ? "Situation de crise" : "Situation Normale"}
              </h3>
              <p
                className={`text-sm whitespace-pre-wrap break-words min-h-16 ${
                  isCrisis
                    ? "text-red-700 dark:text-red-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isCrisis
                  ? (crisisDescription || "Crise déclarée, description non renseignée.")
                  : "Jusqu'à preuve du contraire, tout va bien."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">L&apos;essentiel de l&apos;info</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words min-h-16">
                {countrySituation || "Aucune information renseignée."}
              </p>
            </div>

            {electionMode && (
              <div className="rounded-lg p-4 border text-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Élection — Rappel des règles
                </div>
                <div className="text-base font-bold mt-2 text-amber-800 dark:text-amber-200">
                  Scrutin uninominal majoritaire à deux tour
                </div>
                <div className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  1 siège = 1 voix
                </div>
              </div>
            )}

            {!electionMode && (
              <>
                {isNoConfidenceMotion ? (
                  <div className="rounded-lg p-4 border text-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Motion de censure — Rappel des règles
                    </div>
                    <div className="text-base font-bold mt-2 text-amber-800 dark:text-amber-200">
                      Majorité absolue requise
                    </div>
                    <div className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      50% + 1 voix des inscrits
                    </div>
                    {useEnclumeLaw && (
                      <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                        <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                          Chronomètre Loi de l’Enclume ({enclumeDurationMinutes}:00 max)
                        </div>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{enclumeTimerLabel}</div>
                      </div>
                    )}
                  </div>
                ) : useEnclumeLaw ? (
                  <div className="rounded-lg p-4 border text-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <div className="text-base font-bold mt-2 text-amber-800 dark:text-amber-300">
                      Loi de l&apos;Enclume — Rappel des règles
                    </div>
                    <div className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-200">
                      Loi adoptée sans vote, engageant la responsabilité du président
                    </div>
                    <div className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Exception : La loi n&apos;est pas adopté si une motion de censure est adoptée avant la fin du chronomètre
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-700">
                      <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                        Chronomètre ({enclumeDurationMinutes}:00)
                      </div>
                      <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{enclumeTimerLabel}</div>
                      <div className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        {enclumeStatus === "adopted"
                          ? "Résultat : Adoptée"
                          : enclumeStatus === "rejected"
                          ? "Résultat : Rejetée"
                          : "Vote en attente de l'issue du chronomètre"}
                      </div>
                    </div>
                  </div>
                ) : isDecretMode ? (
                  <div className="rounded-lg p-4 border text-center bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Décret — Rappel des règles
                    </div>
                    <div className="text-base font-bold mt-2 text-amber-800 dark:text-amber-200">
                      Un décret proposé par le président est appliqué par défaut
                    </div>
                    <div className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Il faut une super majorité de votes contre pour le bloquer
                    </div>
                    <div className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Seuil actuel : {superMajorityRatio}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg p-4 border text-center ${
                      isControlValidated === "conforme"
                        ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-800"
                        : isControlValidated === "nonConforme"
                        ? "bg-rose-50 dark:bg-rose-900 border-rose-200 dark:border-rose-800"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        isControlValidated === "conforme"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : isControlValidated === "nonConforme"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Avis de la Cour Constitutionnelle
                    </div>
                    <div
                      className={`text-3xl font-bold mt-2 ${
                        isControlValidated === "conforme"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : isControlValidated === "nonConforme"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isControlValidated === "conforme"
                        ? "Loi conforme à la Constitution"
                        : isControlValidated === "nonConforme"
                        ? "Loi non-conforme à la Constitution"
                        : "La Cour n’a pas statué"}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {requiredMajority === "super"
                        ? `Super Majorité nécessaire (${superMajorityRatio})`
                        : "Majorité Simple nécessaire"}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {vetoMode === "president" ? "Droit de véto : Président" : ""}
                    </div>
                  </div>
                )}

                {!isNoConfidenceMotion && !useEnclumeLaw && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 break-words">
                      {title || "Proposition de loi"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {paragraph || "Texte de loi"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Jauges au-dessus de l'hémicycle */}
          <div>
            <div className="w-full max-w-3xl justify-self-center mb-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Jauges de la République</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Colonne gauche: Économie + Social */}
                  <div className="space-y-4">
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
                  </div>

                  {/* Colonne droite: Sécurité + Budget */}
                  <div className="space-y-4">
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
                      <div className="flex items-center justify-center gap-0 max-w-[300px] mx-auto">
                        {Array.from({ length: 15 }).map((_, idx) => {
                          const center = 7;
                          const distance = idx - center;

                          if (distance === 0) {
                            return (
                              <div
                                key={`budget-center-${idx}`}
                                className="h-4 w-4 shrink-0 rounded-sm border border-gray-400 bg-white"
                                title="Équilibre"
                              />
                            );
                          }

                          if (distance < 0) {
                            const needed = -clampedBudget;
                            const slotFromCenter = -distance;
                            const show = clampedBudget < 0 && slotFromCenter <= needed;
                            return show ? (
                              <div
                                key={`budget-neg-${idx}`}
                                className="h-4 w-4 shrink-0 rounded-sm border border-red-700 bg-red-500"
                                title="Déficit"
                              />
                            ) : (
                              <div key={`budget-neg-empty-${idx}`} className="h-4 w-4 shrink-0" />
                            );
                          }

                          const needed = clampedBudget;
                          const slotFromCenter = distance;
                          const show = clampedBudget > 0 && slotFromCenter <= needed;
                          return show ? (
                            <div
                              key={`budget-pos-${idx}`}
                              className="h-4 w-4 shrink-0 rounded-sm border border-green-700 bg-green-500"
                              title="Excédent"
                            />
                          ) : (
                            <div key={`budget-pos-empty-${idx}`} className="h-4 w-4 shrink-0" />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start mb-8">
              <div className="w-full max-w-3xl justify-self-center">
                <div className="flex justify-center items-start self-start">{hemicycleOrSecretBlock}</div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Niveau de Contrôle des Provinces
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(provinces) as string[]).map((name) => {
                      const status = provinces[name];
                      const dangerBackground =
                        status === "Zone de Non-Droit" ||
                        status === "Insurrection" ||
                        status === "Défiance" ||
                        status === "Pacifié" ||
                        status === "Contrôle Total";

                      return (
                        <div
                          key={name}
                          className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${
                            dangerBackground ? "bg-red-100 dark:bg-red-950/40" : ""
                          }`}
                        >
                          <span className="text-xs text-gray-700 dark:text-gray-300">{name}</span>
                          <span className={`text-xs font-semibold ${getProvinceControlColor(status)}`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    Relations Internationales
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(regionalStates) as string[]).map((name) => (
                      <div key={name} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{name}</span>
                        <span className={`text-xs font-semibold ${getRegionalStateColor(regionalStates[name])}`}>
                          {regionalStates[name]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!electionMode && passedLaws.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      Historique des lois
                    </h3>
                    <div className="space-y-2 max-h-52 overflow-auto pr-1">
                      {passedLaws.map((law, idx) => (
                        <div
                          key={`hist-law-${idx}-${law.title}`}
                          className="rounded border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-black/20 p-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 break-words">
                              {law.title || "Sans titre"}
                            </span>
                            <button
                              type="button"
                              disabled={!canManageLawsFromHere}
                              onClick={() => onToggleLawAbrogation?.(idx)}
                              className={`px-2 py-1 text-[10px] font-semibold rounded-md text-white transition ${
                                law.abrogee
                                  ? "bg-indigo-600 hover:bg-indigo-700"
                                  : "bg-rose-600 hover:bg-rose-700"
                              } ${!canManageLawsFromHere ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              {law.abrogee ? "Réinstituer" : "Abroger"}
                            </button>
                          </div>
                          <div className="mt-1 text-[10px] text-gray-600 dark:text-gray-300">
                            {law.abrogee ? "Statut : Abrogée" : "Statut : En vigueur"}
                          </div>
                          {law.decret ? (
                            <div className="mt-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                              Décret
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 grid">
              <div className="w-full max-w-3xl justify-self-start">
                {isSecretCounting ? (
                  <div className="w-full grid grid-cols-1">
                    <div className="p-4 rounded-lg text-center md:h-full flex items-center justify-center md:min-w-[500px] bg-amber-50 dark:bg-amber-950">
                      <div className="text-base md:text-lg font-semibold text-amber-700 dark:text-amber-300">
                        Dépouillement en cours
                      </div>
                    </div>
                  </div>
                ) : electionMode ? (
                  <div
                    className={`w-full grid grid-cols-1 ${
                      normalizedCandidates.length >= 3 ? "md:grid-cols-4" : "md:grid-cols-2"
                    } gap-3`}
                  >
                    {electionResults.map((c, idx) => (
                      <div
                        key={`cand-${idx}-${c.name}`}
                        className="rounded-lg p-4 border text-center"
                        style={{
                          backgroundColor: `${c.color}22`,
                          borderColor: `${c.color}66`,
                        }}
                      >
                        <div className="text-sm font-semibold break-words" style={{ color: c.color }}>
                          {c.name}
                        </div>
                        <div className="text-3xl font-bold mt-2" style={{ color: c.color }}>
                          {c.votes}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:[grid-template-columns:minmax(0,2fr)_minmax(0,1fr)] gap-4">
                    <div className={`p-4 rounded-lg text-center md:h-full flex items-center justify-center md:min-w-[500px] ${majorityStatus.bg}`}>
                      <div className={`text-base md:text-lg font-semibold ${majorityStatus.tone}`}>{majorityStatus.label}</div>
                    </div>
                    <div className="grid grid-rows-2 gap-4 md:w-full md:max-w-[130px] md:justify-self-start">
                      <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-green-600 dark:text-green-300">Votes Pour</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{counts.green}</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-center">
                        <div className="text-sm font-medium text-red-600 dark:text-red-300">Votes Contres</div>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{counts.against}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {electionMode
          ? "Mode élection : cliquez pour attribuer la voix au candidat actif (clic à nouveau pour annuler)"
          : "Cliquez sur les sièges (y compris du Président) pour changer la couleur (Blanc → Vert → Rouge → Orange → Noir)"}
      </p>
    </div>
  );
}

const getProvinceControlColor = (value: ProvinceControl): string => {
  if (value === "Autonomie" || value === "Stable") return "text-blue-700 dark:text-blue-300";
  if (value === "Prospère" || value === "Pacifié" || value === "Rayonnante") return "text-green-700 dark:text-green-300";
  if (value === "Insoumission" || value === "Contestation" || value === "Insurrection" || value === "Défiance") {
    return "text-orange-700 dark:text-orange-300";
  }
  if (value === "Sécession" || value === "Sédition" || value === "Contrôle Total" || value === "Zone de Non-Droit") {
    return "text-red-700 dark:text-red-300";
  }
  return "text-gray-700 dark:text-gray-300";
};

const getRegionalStateColor = (value: RegionalStateControl): string => {
  if (value === "En Guerre" || value === "Antagoniste") return "text-red-700 dark:text-red-300";
  if (value === "Rival" || value === "Prudent") return "text-orange-700 dark:text-orange-300";
  if (value === "Coopératif" || value === "Allié") return "text-green-700 dark:text-green-300";
  if (value === "Fantoche") return "text-blue-700 dark:text-blue-300";
  return "text-gray-700 dark:text-gray-300";
};

