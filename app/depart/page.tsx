"use client";

import { useEffect, useState } from "react";

export default function DepartPage() {
  const [, setIsFullscreen] = useState(false);

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

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Situation de départ du pays
        </h1>

        <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
          <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <h2 className="font-bold mb-2">Liste des Paliers</h2>
            <p><strong>Niveau de Contrôle des Provinces :</strong></p>
            <p>
              <span className="text-gray-700 dark:text-gray-300">Équilibre</span> ➔{" "}
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Stable</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Prospère</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Rayonnante</span>
            </p>
            <p className="mb-2">
              Impact : Augmente le{" "}
              <span className="font-bold text-black dark:text-white">Budget</span>{" "}
              à chaque tour car la bureaucratie fonctionne parfaitement.
            </p>
            <p>
              <span className="text-gray-700 dark:text-gray-300">Équilibre</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Contestation</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Insoumission</span> ➔{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">Sédition</span> ➔{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">Indépendance</span> (Perte de la province).
            </p>
            <p className="mb-2">Impact : Baisse la Sécurité et demande des “Lois d&apos;Exception” pour être stabilisé.</p>

            <p><strong>Les Relations Diplomatique :</strong></p>
            <p>
              <span className="text-gray-700 dark:text-gray-300">Indifférent</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Prudent</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Rivalité</span> ➔{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">Antagoniste</span> ➔{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">En Guerre</span>.
            </p>
            <p className="mb-2">
              <span className="text-gray-700 dark:text-gray-300">Indifférent</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Coopératif</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Allié</span> ➔{" "}
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Fantoche</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Annexation</span> (Gain d’une province)
            </p>

            <p><strong>Intégration d’une Province récemment annexée :</strong></p>
            <p>
              <span className="text-red-700 dark:text-red-300 font-semibold">Zone de Non-Droit</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Insurrection</span> ➔{" "}
              <span className="text-orange-700 dark:text-orange-300 font-semibold">Défiance</span> ➔{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Pacifiée</span> ➔{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">Contrôle total</span> ➔{" "}
              <span className="text-gray-700 dark:text-gray-300">Equilibre</span>.
            </p>
            <p className="mt-1">
              Impact : Garder une province récemment annexée au même niveau de contrôle coûte{" "}
              <span className="font-bold text-black dark:text-white">1 de Budget</span>, et coûte{" "}
              <span className="font-bold text-black dark:text-white">2 de Budget</span> pour réduire le niveau d’insurrection.
              Sinon, baisse du niveau de controle de 1 à chaque cycle.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <h2 className="font-bold mb-2">Liste des Provinces</h2>

            <p className="mb-3 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Règle générale :</span>{" "}
              Si <span className="font-semibold">2 décrets</span> sont appliqués dans une province,
               des <span className="font-semibold">jetons d&apos;influence bonus</span> seront accordés aux partis soutenus dans la province.
            </p>

            <p><strong>La Capitale (<span className="text-green-700 dark:text-green-300">Prospère</span>)</strong> : Siège du pouvoir politique, ici tout est jeu d’influence et de politique. Quand la Capitale éternue, la République s’enrhume.</p>
            <p className="mb-2">
              Impact :{" "}
              <span className="font-bold text-black dark:text-white">Budget</span>{" "}
              -2 si la province passe en dessous de{" "}
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Stable</span>. Soutien : Les Conservateur et Radicaux.
            </p>

            <p><strong>Le Plateau (<span className="text-gray-700 dark:text-gray-300">Equilibre</span>)</strong> : Carrefour des routes commerciales, Province plutôt libérale, elle est la province la plus riche de la République.</p>
            <p className="mb-2">
              Impact : Tant qu’elle est plus haute que{" "}
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Stable</span>,{" "}
              <span className="text-red-700 dark:text-red-300 font-semibold">Économie</span>{" "}
              {">"} 3 hors Crise. Soutien : Les Libéraux et Radicaux.
            </p>

            <p><strong>Les Hauteurs Profondes (<span className="text-blue-700 dark:text-blue-300">Stable</span>)</strong> : Province minière et militaire. Elle est fidèle, mais exigeante en budget.</p>
            <p className="mb-2">
              Impact : Fournit un point de{" "}
              <span className="text-blue-700 dark:text-blue-300 font-semibold">Sécurité</span>{" "}
              par{" "}
              <span className="font-bold text-black dark:text-white">Budget</span>{" "}
              Dépensé. Soutient : Les Nationalistes et Militaristes.
            </p>

            <p><strong>Vallée de l’Armoire (<span className="text-orange-700 dark:text-orange-300">Contestation</span>)</strong> : Le grenier à blé du pays. Si elle bascule en contestation, le peuple a faim.</p>
            <p className="mb-2">
              Impact : Chaque tour en contestation,{" "}
              <span className="text-green-700 dark:text-green-300 font-semibold">Social</span>{" "}
              -1. Soutien : Les Populistes et Socialistes.
            </p>

            <p><strong>Provinces des Plasticiens (<span className="text-orange-700 dark:text-orange-300">Contestation</span>)</strong> : Province du peuple plasticien, une minorité qui ne s’est jamais réellement intégrée.</p>
            <p className="mb-2">Impact : Les lois restrictives ou nationalistes font baisser son statut vers Sédition et des Crises peuvent naître ici. Soutien : Les Écolos et Progressistes.</p>

            <p><strong>Archipel d&apos;Eldrazi (<span className="text-gray-700 dark:text-gray-300">Equilibre</span>)</strong> : Province d’outre-mer qui flirte avec l&apos;idée de devenir indépendante, mais source de convoitise.</p>
            <p>
              Impact :{" "}
              <span className="font-bold text-black dark:text-white">Budget</span>{" "}
              -1 par tour tant qu’elle n’est pas autonome ou indépendante.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <h2 className="font-bold mb-2">Listes des Pays</h2>

            <p className="mt-2"><strong>L’Outre-Porte (<span className="text-orange-700 dark:text-orange-300">Prudent</span>)</strong> : Jeune royaume indépendant, le pays est séparé entre deux peuples, dont un proche de nous. Le concept de Grande Gérionie considère l’Outre-Porte comme incluse dans nos frontières naturelles.</p>
            <p className="mt-2"><strong>L’Alliance des Etats d’Elimat (<span className="text-gray-700 dark:text-gray-300">Indifférent</span>)</strong> :  Superpuissance régionale, son hégémonie économique et militaire est telle que ce pays est le gendarme du monde et personne n&apos;ose imaginer l&apos;état de l’économie mondiale si celle d’Elimat venait à s’effondrer.</p>
            <p className="mt-2"><strong>Empire de Tori Value (<span className="text-orange-700 dark:text-orange-300">Rivalité</span>)</strong> : Rival historique de la République de Gérionie, cela fait 3 décennies que les deux états ont signé l&apos;armistice. Malgré cela, les tensions restent, tout comme la revendication torivaluenne sur  l’archipel d&apos;Eldrazi.</p>
            <p className="mt-2"><strong>Junte des Emirats du Sud (<span className="text-green-700 dark:text-green-300">Coopératif</span>)</strong> : Junte dirigé par un émir atypique, qui s&apos;est pris d&apos;affection pour votre république singulière. Bien que l&apos;émir n&apos;hésite pas à financer des projets pharaoniques sur votre territoire, son peuple souffre de son régime absolutiste et dictatorial.</p>
            <p className="mt-2"><strong>Royaume de Luvonie (<span className="text-gray-700 dark:text-gray-300">Indifférent</span>)</strong> : Situé au nord-ouest de la République, la Luvonie est une nation de montagnes escarpées et de côtes stratégiques, agissant comme le poumon maritime du Nord.</p>
            <p className="mt-2>"> Loin d&apos;être une terre désolée, elle constitue le port majeur et indispensable pour tout le commerce avec les nations situées de l&apos;autre côté de la Mer de Thalj. Elle observe d&apos;un œil froid les conflits entre la Gérionie et l&apos;Outre-Porte, prête à verrouiller ses frontières au moindre signe d&apos;instabilité.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
