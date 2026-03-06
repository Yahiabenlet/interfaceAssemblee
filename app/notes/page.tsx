"use client";

import { useEffect, useState } from "react";

export default function NotesPage() {
  const [notes, setNotes] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hemicycleNotes");
    if (saved !== null) setNotes(saved);
  }, []);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen?.();
        }
      } catch {}
    };
    enterFullscreen();

    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-black/60 hover:bg-black/80 text-white rounded-md border border-white/30 transition"
          title="Basculer plein écran"
        >
          {isFullscreen ? "Quitter plein écran" : "Plein écran"}
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Lois précédemments votées</h1>
        <textarea
          value={notes}
          readOnly
          rows={24}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Aucun texte"
        />
      </div>
    </div>
  );
}
