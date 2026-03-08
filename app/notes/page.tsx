"use client";

import { useEffect, useMemo, useState } from "react";

type PassedLaw = {
  title: string;
  text: string;
  abrogee?: boolean;
  adopteeSousEnclume?: boolean;
  organique?: boolean;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<PassedLaw[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("hemicycleNotes");
      if (saved == null) {
        setNotes([]);
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } catch {
        setNotes([]);
      }
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "hemicycleNotes") load();
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
    } else {
      const enterFullscreen = async () => {
        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen?.();
          }
        } catch {}
      };
      enterFullscreen();
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

  const activeLaws = useMemo(() => notes.filter((law) => !law.abrogee), [notes]);
  const repealedLaws = useMemo(() => notes.filter((law) => law.abrogee), [notes]);

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center relative">
      <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Lois précédemment votées</h1>

        <div className="w-full h-[70vh] overflow-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 p-3">
              <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
                Lois en vigueur ({activeLaws.length})
              </h2>
              {activeLaws.length === 0 ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">Aucune loi en vigueur.</p>
              ) : (
                <div className="space-y-4">
                  {activeLaws.map((law, idx) => (
                    <div
                      key={`active-${law.title}-${idx}`}
                      className="rounded-lg border p-3 border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                        {law.title || "Sans titre"}
                      </h3>
                      {law.adopteeSousEnclume ? (
                        <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Adoptée sous loi de l’Enclume
                        </p>
                      ) : null}
                      {law.organique ? (
                        <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                          Loi organique (supermajorité requise)
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {law.text || "Sans texte"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-950/20 p-3">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">
                Lois abrogées ({repealedLaws.length})
              </h2>
              {repealedLaws.length === 0 ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">Aucune loi abrogée.</p>
              ) : (
                <div className="space-y-4">
                  {repealedLaws.map((law, idx) => (
                    <div
                      key={`repealed-${law.title}-${idx}`}
                      className="rounded-lg border p-3 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                        {law.title || "Sans titre"}{" "}
                        <span className="text-red-700 dark:text-red-300">(Abrogée)</span>
                      </h3>
                      {law.adopteeSousEnclume ? (
                        <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Adoptée sous loi de l’Enclume
                        </p>
                      ) : null}
                      {law.organique ? (
                        <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                          Loi organique (supermajorité requise)
                        </p>
                      ) : null}
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
      </div>
    </div>
  );
}
