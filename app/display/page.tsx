"use client";

import { useEffect, useState } from "react";
import Hemicycle from "../components/Hemicycle";

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
  budgetGauge?: number;
  countrySituation?: string;
  isCrisis?: boolean;
  crisisDescription?: string;
  provinces?: ProvinceState;
  regionalStates?: RegionalState;
  passedLaws?: Array<{ title: string; text: string; abrogee?: boolean; organique?: boolean; nonConforme?: boolean }>;
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
  revealSecretResults?: boolean;
  electionMode?: boolean;
  candidateCount?: number;
  candidateNames?: string[];
  candidateColors?: string[];
  activeCandidateIndex?: number;
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
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  const toggleLawAbrogationFromDisplay = (index: number) => {
    const raw = localStorage.getItem("hemicycleState");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as DisplayState;
      const laws = Array.isArray(parsed.passedLaws) ? [...parsed.passedLaws] : [];
      if (index < 0 || index >= laws.length) return;

      const current = laws[index];
      laws[index] = { ...current, abrogee: !current.abrogee };

      const nextState = { ...parsed, passedLaws: laws };
      localStorage.setItem("hemicycleState", JSON.stringify(nextState));
      localStorage.setItem("hemicycleNotes", JSON.stringify(laws));
      setState(nextState);
    } catch {}
  };

  if (!state) return <div className="w-screen h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative">
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
          budgetGauge={state.budgetGauge ?? 0}
          countrySituation={state.countrySituation ?? ""}
          isCrisis={state.isCrisis ?? false}
          crisisDescription={state.crisisDescription ?? ""}
          provinces={
            state.provinces ?? {
              "201D": "Sécession",
              "202D-Plateau": "Sécession",
              "202D-Profond": "Sécession",
              "204D": "Sécession",
              "Provinces des Plasticiens": "Sécession",
            }
          }
          regionalStates={
            state.regionalStates ?? {
              "Etat de Tori Valu": "Indifférent",
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
          revealSecretResults={state.revealSecretResults ?? false}
          electionMode={state.electionMode ?? false}
          candidateNames={(state.candidateNames ?? ["Candidat 1"]).slice(0, state.candidateCount ?? 1)}
          candidateColors={(state.candidateColors ?? ["#4f46e5"]).slice(0, state.candidateCount ?? 1)}
          passedLaws={state.passedLaws ?? []}
          onToggleLawAbrogation={toggleLawAbrogationFromDisplay}
          readOnly
        />
      </div>
    </div>
  );
}
