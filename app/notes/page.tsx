"use client";

import { useEffect, useState } from "react";

type PassedLaw = {
  title: string;
  text: string;
  abrogee?: boolean;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<PassedLaw[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hemicycleNotes");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } catch {
        setNotes([]);
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Lois précédemment votées</h1>

        <div className="w-full h-[70vh] overflow-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
          {notes.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">Aucune loi enregistrée.</p>
          ) : (
            <div className="space-y-4">
              {notes.map((law, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 ${
                    law.abrogee
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40"
                      : "border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20"
                  }`}
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                    {law.title || "Sans titre"}{" "}
                    {law.abrogee ? <span className="text-red-700 dark:text-red-300">(Abrogée)</span> : null}
                  </h2>
                  <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {law.text || "Sans texte"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
