"use client";

import { useEffect, useState } from "react";

export default function CartePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
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
      await document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      await document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      className="min-h-screen bg-black p-6 flex flex-col items-center justify-center relative"
      style={{ zoom: 1.2 }}
    >
      {!isFullscreen && (
        <div className="absolute top-6 right-6 flex flex-col gap-2">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
          >
            Plein écran
          </button>
          <button
            onClick={() => window.open("/depart", "_blank", "noopener,noreferrer")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Situation de départ
          </button>
        </div>
      )}

      <div className="w-full max-w-7xl">
        {imageError ? (
          <div className="w-full aspect-video bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-lg font-semibold mb-2">Carte non trouvée</p>
              <p className="text-gray-400 text-sm">Le fichier carte_Oriente90.jpg n'existe pas.</p>
              <p className="text-gray-400 text-sm mt-2">Vérifiez que le fichier est dans le dossier public/</p>
            </div>
          </div>
        ) : (
          <img
            src="/carte_Oriente90.jpg"
            alt="Carte Nord masquée"
            className="w-full h-auto rounded-lg shadow-lg"
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
