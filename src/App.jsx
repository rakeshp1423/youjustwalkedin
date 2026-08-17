import { AnimatePresence } from "framer-motion";
import { useState } from "react";

import Home from "./pages/Home";
import SceneLoader from "./components/SceneLoader";
import RadioPlayer from "./components/RadioPlayer";

import stations from "./data/stations";

function App() {
  const [currentStation, setCurrentStation] = useState(null);
  const [loadingStation, setLoadingStation] = useState(null);

  const handleEnterStation = (station) => {
    setLoadingStation(station);
  };

  const handleLoaderComplete = () => {
    setCurrentStation(loadingStation);
    setLoadingStation(null);
  };

  const handleLeaveStation = () => {
    setCurrentStation(null);
    setLoadingStation(null);
  };

  const handleSurpriseMe = () => {
    const stationList = Object.values(stations);

    const randomStation =
      stationList[Math.floor(Math.random() * stationList.length)];

    setLoadingStation(randomStation);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!currentStation && !loadingStation && (
          <Home
            key="home"
            stations={stations}
            onEnterStation={handleEnterStation}
            onSurpriseMe={handleSurpriseMe}
          />
        )}

        {loadingStation && (
          <SceneLoader
            key="loader"
            station={loadingStation}
            onComplete={handleLoaderComplete}
          />
        )}

        {currentStation && (
          <RadioPlayer
            key="player"
            station={currentStation}
            onLeave={handleLeaveStation}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;