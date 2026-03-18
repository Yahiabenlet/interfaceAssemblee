"use client";

import { useEffect, useMemo, useState } from "react";

type PhoneVoteChoice = string;

type HemicycleState = {
  numSeats?: number;
  isNoConfidenceMotion?: boolean;
  isDecretMode?: boolean;
  electionMode?: boolean;
  choiceMode?: boolean;
  choiceOptionCount?: 2 | 3;
  choiceUseProposals?: boolean;
  choiceCustomLabels?: string[];
  choiceColors?: string[];
  candidateCount?: number;
  candidateNames?: string[];
  candidateColors?: string[];
  proposals?: { title: string; text: string; organique?: boolean; decret?: boolean }[];
  phoneVotes?: {
    connectedSeats: number[];
    votes: Record<number, PhoneVoteChoice>;
  };
};

export default function TelephonePage() {
  const [state, setState] = useState<HemicycleState | null>(null);
  const [seatInput, setSeatInput] = useState("");
  const [connectedSeat, setConnectedSeat] = useState<number | null>(null);

  const load = () => {
    const raw = localStorage.getItem("hemicycleState");
    if (!raw) return;
    try {
      setState(JSON.parse(raw));
    } catch {}
  };

  useEffect(() => {
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hemicycleState") load();
    };
    window.addEventListener("storage", onStorage);
    const t = setInterval(load, 300);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);

  const maxSeat = useMemo(() => (state?.numSeats ?? 0) + 1, [state?.numSeats]); // +1 = Président

  const connectSeat = () => {
    const n = Number(seatInput);
    if (!Number.isFinite(n) || n < 1 || n > maxSeat) return;

    const raw = localStorage.getItem("hemicycleState");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as HemicycleState;
      const current = parsed.phoneVotes ?? { connectedSeats: [], votes: {} };
      if (!current.connectedSeats.includes(n)) current.connectedSeats.push(n);

      parsed.phoneVotes = current;
      localStorage.setItem("hemicycleState", JSON.stringify(parsed));
      setConnectedSeat(n);
      setSeatInput("");
      load();
    } catch {}
  };

  const vote = (choice: PhoneVoteChoice) => {
    if (!connectedSeat) return;
    const raw = localStorage.getItem("hemicycleState");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as HemicycleState;
      const current = parsed.phoneVotes ?? { connectedSeats: [], votes: {} };

      if (!current.connectedSeats.includes(connectedSeat)) current.connectedSeats.push(connectedSeat);
      current.votes[connectedSeat] = choice;

      parsed.phoneVotes = current;
      localStorage.setItem("hemicycleState", JSON.stringify(parsed));
      load();
    } catch {}
  };

  const modeLabel = state?.isNoConfidenceMotion
    ? "Motion de censure"
    : state?.isDecretMode
    ? "Décret"
    : state?.choiceMode
    ? "Mode choix"
    : state?.electionMode
    ? "Élection"
    : "Vote classique";

  const choiceOptions = useMemo(() => {
    if (state?.choiceMode) {
      const count = state.choiceOptionCount ?? 2;
      const colors = (state.choiceColors ?? ["#22c55e", "#ef4444", "#f59e0b"]).slice(0, count);
      while (colors.length < count) colors.push(["#22c55e", "#ef4444", "#f59e0b"][colors.length] ?? "#22c55e");

      const labels =
        state.choiceUseProposals
          ? Array.from({ length: count }).map((_, i) => state.proposals?.[i]?.title?.trim() || `Choix ${i + 1}`)
          : Array.from({ length: count }).map((_, i) => state.choiceCustomLabels?.[i]?.trim() || `Choix ${i + 1}`);

      return labels.map((label, i) => ({ label, value: colors[i] }));
    }

    if (state?.electionMode) {
      const count = state.candidateCount ?? (state.candidateNames?.length || 1);
      const names = (state.candidateNames ?? ["Candidat 1"]).slice(0, count);
      const colors = (state.candidateColors ?? ["#4f46e5"]).slice(0, count);
      while (colors.length < count) colors.push("#4f46e5");
      return names.map((label, i) => ({ label: label?.trim() || `Candidat ${i + 1}`, value: colors[i] }));
    }

    if (state?.isDecretMode) {
      return [
        { label: "Soutien", value: "yes" },
        { label: "Contre", value: "no" },
      ];
    }

    return [
      { label: "Oui", value: "yes" },
      { label: "Non", value: "no" },
    ];
  }, [state]);

  const currentVote = connectedSeat && state?.phoneVotes?.votes ? state.phoneVotes.votes[connectedSeat] ?? "none" : "none";

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Téléphone — Vote</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">Mode en cours : {modeLabel}</p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Numéro de siège (1 à {maxSeat}, {maxSeat} = Président)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={connectSeat}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Connecter
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Siège connecté : <span className="font-semibold">{connectedSeat ?? "Aucun"}</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Vote actuel : <span className="font-semibold">{currentVote === "yes" ? "Oui" : currentVote === "no" ? "Non" : "Blanc"}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {choiceOptions.map((opt, idx) => (
            <button
              key={`phone-vote-${idx}-${opt.label}`}
              onClick={() => vote(opt.value)}
              className="px-3 py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: opt.value.startsWith("#") ? opt.value : opt.value === "yes" ? "#16a34a" : "#dc2626" }}
            >
              {opt.label}
            </button>
          ))}
          <button onClick={() => vote("none")} className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold">
            Blanc
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300">
          Vote actuel : <span className="font-semibold">{currentVote}</span>
        </p>
      </div>
    </div>
  );
}
