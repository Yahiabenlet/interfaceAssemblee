"use client";

import { useEffect, useState } from "react";
import Hemicycle from "../components/Hemicycle";

type SeatColor = "white" | "green" | "red";

type DisplayState = {
  numSeats: number;
  title: string;
  paragraph: string;
  seatColors: SeatColor[];
  presidentColor: SeatColor;
};

export default function DisplayPage() {
  const [state, setState] = useState<DisplayState | null>(null);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("hemicycleState");
      if (!raw) return;
      try {
        setState(JSON.parse(raw));
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

  if (!state) return <div className="w-screen h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <Hemicycle
          numSeats={state.numSeats}
          title={state.title}
          paragraph={state.paragraph}
          seatColors={state.seatColors}
          presidentColor={state.presidentColor}
          onToggleSeat={() => {}}
          onTogglePresident={() => {}}
          readOnly
        />
      </div>
    </div>
  );
}
