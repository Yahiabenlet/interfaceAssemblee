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
  economyGauge?: number;
  socialGauge?: number;
  securityGauge?: number;
};

export default function DisplayPage() {
  const [state, setState] = useState<DisplayState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  if (!state) return <div className="w-screen h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative">
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-md border border-white/30 transition"
        title="Basculer plein écran (touche F)"
      >
        {isFullscreen ? "Quitter plein écran" : "Plein écran"}
      </button>

      <div className="w-full max-w-5xl">
        <Hemicycle
          numSeats={state.numSeats}
          title={state.title}
          paragraph={state.paragraph}
          seatColors={state.seatColors}
          presidentColor={state.presidentColor}
          onToggleSeat={() => {}}
          onTogglePresident={() => {}}
          economyGauge={state.economyGauge ?? 0}
          socialGauge={state.socialGauge ?? 0}
          securityGauge={state.securityGauge ?? 0}
          readOnly
        />
      </div>
    </div>
  );
}
