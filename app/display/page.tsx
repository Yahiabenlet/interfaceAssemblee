"use client";

import { useEffect, useState } from "react";
import Hemicycle from "../components/Hemicycle";

type SeatColor = "white" | "green" | "red" | "orange" | "black";
type ProvinceControl =
  | "Indépendant"
  | "Autonomie"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Contrôle Total";

type ProvinceState = Record<string, ProvinceControl>;

type EnclumeStatus = "idle" | "running" | "adopted" | "rejected";

type DisplayState = {
  numSeats: number;
  title: string;
  paragraph: string;
  seatColors: SeatColor[];
  presidentColor: SeatColor;
  economyGauge?: number;
  socialGauge?: number;
  securityGauge?: number;
  countrySituation?: string;
  isCrisis?: boolean;
  crisisDescription?: string;
  provinces?: ProvinceState;
  passedLaws?: Array<{ title: string; text: string; abrogee?: boolean; organique?: boolean }>;
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
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.open("/notes", "_blank", "noopener,noreferrer")}
          className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-md border border-white/30 transition"
          title="Ouvrir l'historique des lois adoptées"
        >
          Historique des lois
        </button>
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-md border border-white/30 transition"
          title="Basculer plein écran (touche F)"
        >
          {isFullscreen ? "Quitter plein écran" : "Plein écran"}
        </button>
      </div>

      <div className="w-full max-w-7xl">
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
          countrySituation={state.countrySituation ?? ""}
          isCrisis={state.isCrisis ?? false}
          crisisDescription={state.crisisDescription ?? ""}
          provinces={
            state.provinces ?? {
              "201D": "Indépendant",
              "202D-Plateau": "Indépendant",
              "202D-Profond": "Indépendant",
              "204D": "Indépendant",
              "Provinces des Plasticiens": "Indépendant",
              "Etat de Tori Valu": "Indépendant",
            }
          }
          isControlValidated={state.isControlValidated ?? "nonConforme"}
          requiredMajority={state.requiredMajority ?? "simple"}
          superMajorityRatio={state.superMajorityRatio ?? "3/5"}
          vetoMode={state.vetoMode ?? "none"}
          isNoConfidenceMotion={state.isNoConfidenceMotion ?? false}
          useEnclumeLaw={state.useEnclumeLaw ?? false}
          enclumeStatus={state.enclumeStatus ?? "idle"}
          enclumeStartedAt={state.enclumeStartedAt ?? null}
          enclumeDurationMinutes={state.enclumeDurationMinutes ?? 4}
          selectedSeatOverlays={state.selectedSeatOverlays ?? {}}
          selectedPresidentOverlay={state.selectedPresidentOverlay ?? null}
          goldOutlinedSeats={state.goldOutlinedSeats ?? []}
          goldOutlinedPresident={state.goldOutlinedPresident ?? false}
          isSecretBallot={state.isSecretBallot ?? false}
          hideAssemblyWhenSecretBallot
          readOnly
        />
      </div>
    </div>
  );
}
