"use client";

import { useMemo } from "react";

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
  countrySituation?: string;
}

type SeatColor = "white" | "green" | "red";

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
  countrySituation = "",
}: HemicycleProps) {
  const counts = useMemo(() => {
    const all = [...seatColors, presidentColor];
    return {
      white: all.filter((c) => c === "white").length,
      green: all.filter((c) => c === "green").length,
      red: all.filter((c) => c === "red").length,
    };
  }, [seatColors, presidentColor]);

  const majorityStatus = useMemo(() => {
    const pour = seatColors.filter((c) => c === "green").length;
    const contre = seatColors.filter((c) => c === "red").length;
    const exprimes = pour + contre;
    if (exprimes === 0) return { label: "Aucune majorité", tone: "text-gray-700 dark:text-gray-200" };
    const ratioPour = pour / exprimes;
    if (ratioPour >= 0.6) return { label: "Super Majorité 3/5", tone: "text-emerald-700 dark:text-emerald-300" };
    if (ratioPour > 0.5) return { label: "Majorité simple (50% + 1 voix)", tone: "text-blue-700 dark:text-blue-300" };
    return { label: "Aucune majorité", tone: "text-gray-700 dark:text-gray-200" };
  }, [seatColors]);

  const seats = useMemo(() => {
    const rows = numSeats < 12 ? 3 : 4;
    const rowRadii = rows === 3 ? [160, 188, 216] : [152, 178, 204, 230];
    const baseWeights = rows === 3 ? [2, 3, 4] : [2, 3, 4, 5];
    const weightSum = baseWeights.reduce((a, b) => a + b, 0);
    const capacities = baseWeights.map((w) => Math.max(1, Math.floor((numSeats * w) / weightSum)));
    let allocated = capacities.reduce((a, b) => a + b, 0);
    let cursor = capacities.length - 1;
    while (allocated < numSeats) { capacities[cursor]++; allocated++; cursor = (cursor - 1 + capacities.length) % capacities.length; }
    while (allocated > numSeats) { const idx = capacities.findIndex((c) => c > 1); if (idx === -1) break; capacities[idx]--; allocated--; }
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
    const rows = numSeats < 12 ? 3 : 4;
    const rowRadii = rows === 3 ? [160, 188, 216] : [152, 178, 204, 230];
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
  };

  const svgBlock = (
    <svg
      viewBox="0 0 500 360"
      className="w-full h-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
    >
      <g transform="translate(250 220) scale(1.12) translate(-250 -220)">
        <path d="M 100 176 A 196 196 0 0 1 400 176" fill="none" stroke="#ccc" strokeWidth="2" className="dark:stroke-gray-600" />
        {seats.map((seat) => (
          <circle
            key={seat.index}
            cx={seat.x}
            cy={seat.y}
            r="12"
            fill={colorMap[seat.color].fill}
            stroke={colorMap[seat.color].stroke}
            strokeWidth="2"
            className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
            onClick={svgOnly || readOnly ? undefined : () => onToggleSeat(seat.index)}
            title={`Siège ${seat.index + 1}`}
          />
        ))}
        <circle
          cx="250"
          cy={presidentY}
          r="13"
          fill={colorMap[presidentColor].fill}
          stroke={colorMap[presidentColor].stroke}
          strokeWidth="2"
          className={svgOnly || readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
          onClick={svgOnly || readOnly ? undefined : onTogglePresident}
        />
        <text x="250" y={presidentY + 32} textAnchor="middle" className="fill-gray-700 dark:fill-gray-200 text-xs">
          Président
        </text>
      </g>
    </svg>
  );

  if (svgOnly) return <div className="w-screen h-screen flex items-center justify-center bg-black">{svgBlock}</div>;

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
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Situation actuelle du pays</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words min-h-16">
                {countrySituation || "Aucune information renseignée."}
              </p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start mb-8">
              <div className="w-full max-w-3xl justify-self-center">
                <div className="flex justify-center items-start self-start">
                  {svgBlock}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 break-words">{title || "Titre"}</h2>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{paragraph || "Votre paragraphe..."}</p>
              </div>
            </div>

            <div className="mt-8 grid">
              <div className="w-full max-w-3xl justify-self-start">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-green-900 p-4 rounded-lg text-center md:h-full flex items-center justify-center">
                    <div className={`text-base md:text-lg font-semibold ${majorityStatus.tone}`}>{majorityStatus.label}</div>
                  </div>
                  <div className="grid grid-rows-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
                      <div className="text-sm font-medium text-green-600 dark:text-green-300">Votes Pour</div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{counts.green}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-center">
                      <div className="text-sm font-medium text-red-600 dark:text-red-300">Votes Contres</div>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{counts.red}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Cliquez sur les sièges (y compris du Président) pour changer la couleur (Blanc → Vert → Rouge)
      </p>
    </div>
  );
}
