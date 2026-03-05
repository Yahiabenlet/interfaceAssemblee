"use client";

import { useState } from "react";
import Hemicycle from "./components/Hemicycle";

export default function Home() {
  const [numSeats, setNumSeats] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputValue);
    if (num >= 5 && num <= 20) {
      setNumSeats(num);
    } else {
      alert("Entrez un nombre entre 5 et 20");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-900 dark:to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Visualiseur d'Hémicycle
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
            <Hemicycle numSeats={numSeats} />
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
