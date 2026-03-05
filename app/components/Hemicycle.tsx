"use client";

import { useState, useMemo } from "react";

interface HemicycleProps {
  numSeats: number;
}

type SeatColor = "white" | "green" | "red";

export default function Hemicycle({ numSeats }: HemicycleProps) {
  const [seatColors, setSeatColors] = useState<SeatColor[]>(Array(numSeats).fill("white"));
  const [presidentColor, setPresidentColor] = useState<SeatColor>("white");

  const nextColor = (current: SeatColor): SeatColor => {
    const colors: SeatColor[] = ["white", "green", "red"];
    return colors[(colors.indexOf(current) + 1) % colors.length];
  };

  const toggleSeatColor = (index: number) => {
    const newColors = [...seatColors];
    newColors[index] = nextColor(newColors[index]);
    setSeatColors(newColors);
  };

  const togglePresidentColor = () => setPresidentColor((c) => nextColor(c));

  const counts = useMemo(() => {
    const all = [...seatColors, presidentColor];
    return {
      white: all.filter((c) => c === "white").length,
      green: all.filter((c) => c === "green").length,
      red: all.filter((c) => c === "red").length,
    };
  }, [seatColors, presidentColor]);

  const seats = useMemo(() => {
    const rows = numSeats < 12 ? 3 : 4;

    // Un peu moins serré qu'avant
    const rowRadii = rows === 3 ? [148, 172, 196] : [140, 162, 184, 206];

    // Répartition progressive vers l'extérieur (style parlementaire)
    const baseWeights = rows === 3 ? [2, 3, 4] : [2, 3, 4, 5];
    const weightSum = baseWeights.reduce((a, b) => a + b, 0);

    const capacities = baseWeights.map((w) => Math.max(1, Math.floor((numSeats * w) / weightSum)));

    // Ajustement pour correspondre exactement à numSeats
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

      // Marge interne: évite d'occuper systématiquement les bouts de rangée
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

        // Base actuelle
        const baseY = 242 - radius * Math.sin(angle);

        // Plus on est proche du centre (t≈0.5), plus on descend vers le bas
        const centerProximity = 1 - Math.abs(t - 0.5) * 2; // 0 aux bords, 1 au centre
        const centerDrop = 14 * centerProximity; // intensité du "creux" au centre

        const y = baseY + centerDrop;

        result.push({ index, x, y, color: seatColors[index] });
        index++;
      }
    }

    return result;
  }, [numSeats, seatColors]);

  const colorMap: Record<SeatColor, { fill: string; stroke: string }> = {
    white: { fill: "#ffffff", stroke: "#9ca3af" },
    green: { fill: "#22c55e", stroke: "#15803d" },
    red: { fill: "#ef4444", stroke: "#b91c1c" },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center mb-8">
          <svg viewBox="0 0 500 360" width="500" height="360" className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            {/* Arc de l'hémicycle aligné sur 40°–140° */}
            <path
              d="M 112 130 A 180 180 0 0 1 388 130"
              fill="none"
              stroke="#ccc"
              strokeWidth="2"
              className="dark:stroke-gray-600"
            />

            {/* Sièges */}
            {seats.map((seat) => (
              <circle
                key={seat.index}
                cx={seat.x}
                cy={seat.y}
                r="10"
                fill={colorMap[seat.color].fill}
                stroke={colorMap[seat.color].stroke}
                strokeWidth="2"
                className="cursor-pointer transition hover:opacity-80"
                onClick={() => toggleSeatColor(seat.index)}
                title={`Siège ${seat.index + 1}`}
              />
            ))}

            {/* Siège du président */}
            <circle
              cx="250"
              cy="315"
              r="11"
              fill={colorMap[presidentColor].fill}
              stroke={colorMap[presidentColor].stroke}
              strokeWidth="2"
              className="cursor-pointer transition hover:opacity-80"
              onClick={togglePresidentColor}
            />
            <text x="250" y="343" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200 text-xs">
              Président
            </text>
          </svg>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Sièges Blancs
            </div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {counts.white}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg text-center">
            <div className="text-sm font-medium text-green-600 dark:text-green-300">
              Sièges Verts
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {counts.green}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-center">
            <div className="text-sm font-medium text-red-600 dark:text-red-300">
              Sièges Rouges
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {counts.red}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Cliquez sur les sièges (y compris Président) pour changer la couleur (Blanc → Vert → Rouge)
      </p>
    </div>
  );
}
