"use client";

import { useEffect, useState } from "react";
import Hemicycle from "./components/Hemicycle";

type SeatColor = "white" | "green" | "red";
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

type ProvinceState = {
  "201D": ProvinceControl;
  "202D-Plateau": ProvinceControl;
  "202D-Profond": ProvinceControl;
  "204D": ProvinceControl;
  "Provinces des Plasticiens": ProvinceControl;
  "Etat de Tori Valu": ProvinceControl;
};

const CONTROL_OPTIONS: ProvinceControl[] = [
  "Indépendant",
  "Autonomie",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "Contrôle Total",
];

export default function Home() {
  const [numSeats, setNumSeats] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [seatColors, setSeatColors] = useState<SeatColor[]>([]);
  const [presidentColor, setPresidentColor] = useState<SeatColor>("white");
  const [economyGauge, setEconomyGauge] = useState(5);
  const [socialGauge, setSocialGauge] = useState(5);
  const [securityGauge, setSecurityGauge] = useState(5);
  const [countrySituation, setCountrySituation] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [crisisDescription, setCrisisDescription] = useState("");
  const [provinces, setProvinces] = useState<ProvinceState>({
    "201D": "Indépendant",
    "202D-Plateau": "Indépendant",
    "202D-Profond": "Indépendant",
    "204D": "Indépendant",
    "Provinces des Plasticiens": "Indépendant",
    "Etat de Tori Valu": "Indépendant",
  });

  const nextColor = (current: SeatColor): SeatColor => {
    const colors: SeatColor[] = ["white", "green", "red"];
    return colors[(colors.indexOf(current) + 1) % colors.length];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue);
    if (num >= 5 && num <= 20) {
      setNumSeats(num);
      setSeatColors(Array(num).fill("white"));
      setPresidentColor("white");
    } else {
      alert("Entrez un nombre entre 5 et 20");
    }
  };

  const toggleSeat = (index: number) => {
    setSeatColors((prev) => {
      const next = [...prev];
      next[index] = nextColor(next[index]);
      return next;
    });
  };

  const togglePresident = () => setPresidentColor((c) => nextColor(c));

  const resetVotes = () => {
    if (numSeats === null) return;
    setSeatColors(Array(numSeats).fill("white"));
    setPresidentColor("white");
  };

  useEffect(() => {
    if (numSeats === null) return;
    localStorage.setItem(
      "hemicycleState",
      JSON.stringify({
        numSeats,
        title,
        paragraph,
        seatColors,
        presidentColor,
        economyGauge,
        socialGauge,
        securityGauge,
        countrySituation,
        isCrisis,
        crisisDescription,
        provinces,
      })
    );
  }, [
    numSeats,
    title,
    paragraph,
    seatColors,
    presidentColor,
    economyGauge,
    socialGauge,
    securityGauge,
    countrySituation,
    isCrisis,
    crisisDescription,
    provinces,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Visualiseur du Parlement
        </h1>

        {numSeats === null ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de sièges :
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  min="5"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Entre 5 et 20"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Créer l'hémicycle
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loi :
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Entrez le nom d'une Loi"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Texte de loi :
                  </label>
                  <textarea
                    value={paragraph}
                    onChange={(e) => setParagraph(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Entrez le texte de loi"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Contrôle des Provinces
                </h3>
                <div className="space-y-3">
                  {(Object.keys(provinces) as Array<keyof ProvinceState>).map((name) => (
                    <div key={name} className="grid grid-cols-[1fr_140px] gap-2 items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                      <select
                        value={provinces[name]}
                        onChange={(e) =>
                          setProvinces((prev) => ({
                            ...prev,
                            [name]: e.target.value as ProvinceControl,
                          }))
                        }
                        className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {CONTROL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-900">
                <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  Économie ({economyGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={economyGauge}
                  onChange={(e) => setEconomyGauge(Number(e.target.value))}
                  className="w-full accent-green-500"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-900">
                <label className="block text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                  Social ({socialGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={socialGauge}
                  onChange={(e) => setSocialGauge(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Sécurité ({securityGauge}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={securityGauge}
                  onChange={(e) => setSecurityGauge(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                L'essentiel de l'info :
              </label>
              <textarea
                value={countrySituation}
                onChange={(e) => setCountrySituation(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Décrivez la situation actuelle..."
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isCrisis}
                  onChange={(e) => setIsCrisis(e.target.checked)}
                  className="h-4 w-4"
                />
                Situation de crise
              </label>
            </div>

            {isCrisis && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description de la crise :
                </label>
                <textarea
                  value={crisisDescription}
                  onChange={(e) => setCrisisDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Décrivez la situation de crise..."
                />
              </div>
            )}

            <div className="mb-4 flex justify-end gap-3">
              <button
                onClick={resetVotes}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
              >
                Reset tous les sièges
              </button>
              <button
                onClick={() => window.open("/display", "_blank", "noopener,noreferrer")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
              >
                Ouvrir l’affichage plein écran
              </button>
            </div>

            <Hemicycle
              numSeats={numSeats}
              title={title}
              paragraph={paragraph}
              seatColors={seatColors}
              presidentColor={presidentColor}
              onToggleSeat={toggleSeat}
              onTogglePresident={togglePresident}
              economyGauge={economyGauge}
              socialGauge={socialGauge}
              securityGauge={securityGauge}
              countrySituation={countrySituation}
              isCrisis={isCrisis}
              crisisDescription={crisisDescription}
              provinces={provinces}
            />
            <button
              onClick={() => setNumSeats(null)}
              className="mt-8 mx-auto block px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Modifier le nombre de sièges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
