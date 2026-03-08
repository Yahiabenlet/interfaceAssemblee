"use client";

import { useEffect, useMemo, useState } from "react";

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

type ProvinceState = Record<string, ProvinceControl>;

type EnclumeStatus = "idle" | "running" | "adopted" | "rejected";

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
  isControlValidated?: "conforme" | "nonConforme" | "nonStatue";
  requiredMajority?: "simple" | "super";
  superMajorityRatio?: string;
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
  electionMode?: boolean;
  candidateNames?: string[];
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
    "201D": "Indépendant",
    "202D-Plateau": "Indépendant",
    "202D-Profond": "Indépendant",
    "204D": "Indépendant",
    "Provinces des Plasticiens": "Indépendant",
    "Etat de Tori Valu": "Indépendant",
  },
  isControlValidated = "nonConforme",
  requiredMajority = "simple",
  superMajorityRatio = "3/5",
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
  electionMode = false,
  candidateNames = ["Candidat 1"],
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

    const pour = registered.filter((c) => c === "green").length;
    const contre = registered.filter((c) => c === "red" || c === "orange").length;
    const exprimes = pour + contre;

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
  }, [seatColors, presidentColor, superThreshold, superMajorityRatio, vetoMode, isNoConfidenceMotion, useEnclumeLaw, enclumeStatus]);

  const seats = useMemo(() => {
    const rows = numSeats < 12 ? 3 : numSeats > 21 ? 5 : 4;
    const rowRadii =
      rows === 3
        ? [160, 188, 216]
        : rows === 4
        ? [152, 178, 204, 230]
        : [144, 168, 192, 216, 240];

    const baseWeights =
      rows === 3 ? [2, 3, 4] : rows === 4 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6];

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
    const rows = numSeats < 12 ? 3 : numSeats > 21 ? 5 : 4;
    const rowRadii =
      rows === 3
        ? [160, 188, 216]
        : rows === 4
        ? [152, 178, 204, 230]
        : [144, 168, 192, 216, 240];

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

        {seats.map((seat) => (
          <g key={seat.index}>
            <circle
              cx={seat.x}
              cy={seat.y}
              r="12"
              fill={colorMap[seat.color].fill}
              stroke={goldSeatSet.has(seat.index) ? "#d4af37" : colorMap[seat.color].stroke}
              strokeWidth={goldSeatSet.has(seat.index) ? "3" : "2"}
              className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={svgOnly || readOnly ? undefined : () => onToggleSeat(seat.index)}
              title={`Siège ${seat.index + 1}`}
            />
          </g>
        ))}

        <circle
          cx="250"
          cy={presidentY}
          r="13"
          fill={colorMap[presidentColor].fill}
          stroke={goldOutlinedPresident ? "#d4af37" : presidentBorder.stroke}
          strokeWidth={goldOutlinedPresident ? 3 : presidentBorder.strokeWidth}
          className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
          onClick={svgOnly || readOnly ? undefined : onTogglePresident}
        />
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

  const clampedBudget = Math.max(-5, Math.min(5, budgetGauge));
  const negativeBoxes = Math.max(0, -clampedBudget);
  const positiveBoxes = Math.max(0, clampedBudget);

  const normalizedCandidates = useMemo(() => {
    const base = candidateNames.slice(0, 8).map((n, i) => (n?.trim() ? n.trim() : `Candidat ${i + 1}`));
    return base.length > 0 ? base : ["Candidat 1"];
  }, [candidateNames]);

  const electionResults = useMemo(() => {
    const expressed = [...seatColors, presidentColor].filter((c) => c === "green").length;
    const count = normalizedCandidates.length;
    const base = Math.floor(expressed / count);
    const rem = expressed % count;
    return normalizedCandidates.map((name, i) => ({
      name,
      votes: base + (i < rem ? 1 : 0),
    }));
  }, [seatColors, presidentColor, normalizedCandidates]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full overflow-x-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start min-w-[980px]">
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Jauges de la République </h3>
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

                  {/* 11 colonnes de largeur identique => espace uniforme */}
                  <div className="grid grid-cols-11 gap-0 max-w-[220px] mx-auto justify-items-center">
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const center = 5; // colonne centrale (0..10)
                      const distance = idx - center;

                      if (distance === 0) {
                        return (
                          <div
                            key={`budget-center-${idx}`}
                            className="h-4 w-4 rounded-sm border border-gray-400 bg-white"
                            title="Équilibre"
                          />
                        );
                      }

                      if (distance < 0) {
                        const needed = -clampedBudget; // nb rouges à afficher
                        const slotFromCenter = -distance; // 1..5
                        const show = clampedBudget < 0 && slotFromCenter <= needed;
                        return show ? (
                          <div
                            key={`budget-neg-${idx}`}
                            className="h-4 w-4 rounded-sm border border-red-700 bg-red-500"
                            title="Déficit"
                          />
                        ) : (
                          <div key={`budget-neg-empty-${idx}`} className="h-4 w-4" />
                        );
                      }

                      const needed = clampedBudget; // nb vertes à afficher
                      const slotFromCenter = distance; // 1..5
                      const show = clampedBudget > 0 && slotFromCenter <= needed;
                      return show ? (
                        <div
                          key={`budget-pos-${idx}`}
                          className="h-4 w-4 rounded-sm border border-green-700 bg-green-500"
                          title="Excédent"
                        />
                      ) : (
                        <div key={`budget-pos-empty-${idx}`} className="h-4 w-4" />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

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
          </div>

          <div>
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
                    {(Object.keys(provinces) as string[]).map((name) => (
                      <div key={name} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-700 dark:text-gray-300">{name}</span>
                        <span className={`text-xs font-semibold ${getProvinceControlColor(provinces[name])}`}>
                          {provinces[name]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

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
            </div>

            <div className="mt-8 grid">
              <div className="w-full max-w-3xl justify-self-start">
                {electionMode ? (
                  <div
                    className={`w-full grid grid-cols-1 ${
                      normalizedCandidates.length >= 3 ? "md:grid-cols-4" : "md:grid-cols-2"
                    } gap-3`}
                  >
                    {electionResults.map((c, idx) => (
                      <div
                        key={`cand-${idx}-${c.name}`}
                        className="rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 text-center"
                      >
                        <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 break-words">
                          {c.name}
                        </div>
                        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-2">
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
          ? "Mode élection : cliquez pour exprimer une voix (Blanc ↔ Vert)"
          : "Cliquez sur les sièges (y compris du Président) pour changer la couleur (Blanc → Vert → Rouge → Orange → Noir)"}
      </p>
    </div>
  );
}

const getProvinceControlColor = (value: ProvinceControl): string => {
  if (value === "Indépendant") return "text-blue-700 dark:text-blue-300";
  if (value === "Autonomie") return "text-green-700 dark:text-green-300";
  if (value === "Contrôle Total") return "text-red-700 dark:text-red-300";
  return "text-gray-700 dark:text-gray-300";
};
