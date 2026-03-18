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

type PhoneVoteChoice = "yes" | "no" | "none";
type PhoneVotesState = {
  connectedSeats: number[];
  votes: Record<number, PhoneVoteChoice>;
};

type ManualVotesState = {
  connectedSeats: number[];
  votes: Record<number, "manual">;
};

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
  proposals?: Array<{ title: string; text: string; organique?: boolean; decret?: boolean }>;
  choiceMode?: boolean;
  choiceOptionCount?: 2 | 3;
  choiceUseProposals?: boolean;
  choiceCustomLabels?: string[];
  choiceColors?: string[];
  activeChoiceIndex?: number;
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
  revealSecretResults?: boolean;
  electionMode?: boolean;
  candidateCount?: number;
  candidateNames?: string[];
  candidateColors?: string[];
  activeCandidateIndex?: number;
  phoneVotes?: PhoneVotesState;
  manualVotes?: ManualVotesState;
};

export default function DisplayPage() {
  const [state, setState] = useState<DisplayState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [appliedSeatColors, setAppliedSeatColors] = useState<SeatColor[]>([]);
  const [appliedPresidentColor, setAppliedPresidentColor] = useState<SeatColor>("white");

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
      if (e.key === "4") openWithFs("/depart");
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

  useEffect(() => {
    if (!state) return;

    const normalize = (v?: string) => (v ?? "").toLowerCase();

    const toSeatColor = (choice: string): SeatColor => {
      const normalized = normalize(choice);

      if (normalized === "none" || normalized === "") return "white";
      if (normalized === "yes") return "green";
      if (normalized === "no") return "red";

      if (state.choiceMode) {
        const allowed = (state.choiceColors ?? ["#22c55e", "#ef4444", "#f59e0b"])
          .slice(0, state.choiceOptionCount ?? 2)
          .map((c) => c.toLowerCase());
        if (allowed.includes(normalized)) return choice as SeatColor;
      }

      if (state.electionMode) {
        const allowed = (state.candidateColors ?? ["#4f46e5"])
          .slice(0, state.candidateCount ?? 1)
          .map((c) => c.toLowerCase());
        if (allowed.includes(normalized)) return choice as SeatColor;
      }

      return "white";
    };

    // Charger votes manuels avec priorité
    const manualVotes = state.manualVotes ?? { connectedSeats: [], votes: {} };
    const phoneVotes = state.phoneVotes ?? { connectedSeats: [], votes: {} };

    const nextSeatColors = [...(state.seatColors ?? [])];

    // Appliquer votes téléphone d'abord
    phoneVotes.connectedSeats.forEach((seatNumber) => {
      const idx = seatNumber - 1;
      if (idx >= 0 && idx < nextSeatColors.length) {
        const vote = phoneVotes.votes[seatNumber] ?? "none";
        // Ne pas appliquer si c'est un vote manuel
        if (!manualVotes.votes[seatNumber]) {
          nextSeatColors[idx] = toSeatColor(vote);
        }
      }
    });

    let nextPresidentColor = state.presidentColor ?? "white";
    const presidentSeatNumber = (state.numSeats ?? 0) + 1;

    // Appliquer vote téléphone du président si pas de vote manuel
    if (phoneVotes.connectedSeats.includes(presidentSeatNumber) && !manualVotes.votes[presidentSeatNumber]) {
      const vote = phoneVotes.votes[presidentSeatNumber] ?? "none";
      nextPresidentColor = toSeatColor(vote);
    } else if (manualVotes.votes[presidentSeatNumber]) {
      // Utiliser la couleur manuelle du président
      nextPresidentColor = state.presidentColor ?? "white";
    }

    setAppliedSeatColors(nextSeatColors);
    setAppliedPresidentColor(nextPresidentColor);
  }, [state]);

  if (!state) return <div className="w-screen h-screen bg-black" />;

  return (
    <div
      className="min-h-screen bg-black p-6 flex items-center justify-center relative overflow-auto"
      style={{ zoom: 0.72 }}
    >
      <div className="w-full max-w-7xl">
        <Hemicycle
          numSeats={state.numSeats}
          title={state.title}
          paragraph={state.paragraph}
          seatColors={appliedSeatColors.length > 0 ? appliedSeatColors : state.seatColors}
          presidentColor={appliedPresidentColor || state.presidentColor}
          onToggleSeat={() => {}}
          onTogglePresident={() => {}}
          economyGauge={state.economyGauge ?? 0}
          socialGauge={state.socialGauge ?? 0}
          securityGauge={state.securityGauge ?? 0}
          budgetGauge={state.budgetGauge ?? 4}
          countrySituation={state.countrySituation ?? ""}
          isCrisis={state.isCrisis ?? false}
          crisisDescription={state.crisisDescription ?? ""}
          provinces={
            state.provinces ?? {
              "La Capitale": "Prospère",
              "Le Plateau": "Équilibre",
              "Les Hauteurs Profondes": "Stable",
              "Vallée de l’Armoire": "Contestation",
              "Provinces des Plasticiens": "Contestation",
              "Archipel des Eldrazi": "Équilibre",
            }
          }
          regionalStates={
            state.regionalStates ?? {
              "L'Outre-Porte": "Prudent",
              "Alliance des Etats d'Elimat": "Indifférent",
              "Empire de Tori Value": "Rival",
              "Junte des Emirats du Sud": "Coopératif",
              "Royaume de Luvonie": "Indifférent",
            }
          }
          isControlValidated={state.isControlValidated ?? "nonConforme"}
          requiredMajority={state.requiredMajority ?? "simple"}
          superMajorityRatio={state.superMajorityRatio ?? "3/5"}
          isDecretMode={state.isDecretMode ?? false}
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
          passedLaws={[]}
          onToggleLawAbrogation={undefined}
          readOnly
          choiceMode={state.choiceMode ?? false}
          choiceOptionCount={state.choiceOptionCount ?? 2}
          choiceUseProposals={state.choiceUseProposals ?? true}
          choiceCustomLabels={state.choiceCustomLabels ?? ["Choix 1", "Choix 2", "Choix 3"]}
          choiceColors={state.choiceColors ?? ["#22c55e", "#ef4444", "#f59e0b"]}
          proposalChoices={state.proposals ?? []}
        />
      </div>
    </div>
  );
}
