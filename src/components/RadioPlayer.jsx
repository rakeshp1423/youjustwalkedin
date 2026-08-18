import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function RadioPlayer({ station, onLeave }) {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const hideTimer = useRef(null);

  const [currentSong, setCurrentSong] = useState(() => {
    const songs = station?.songs || [];

    if (!songs.length) return 0;

    return Math.floor(Math.random() * songs.length);
  });

  const [volume, setVolume] = useState(0.75);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const songs = station?.songs || [];
  const song = songs[currentSong];

  /*
   * ----------------------------------------------------
   * RESET SONG WHEN STATION CHANGES
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!station) return;

    const stationSongs = station.songs || [];

    if (!stationSongs.length) {
      setCurrentSong(0);
      return;
    }

    // Start this scene with a random song.
    const randomIndex = Math.floor(
      Math.random() * stationSongs.length
    );

    setCurrentSong(randomIndex);
  }, [station]);

  /*
   * ----------------------------------------------------
   * CONTROL FADE
   * ----------------------------------------------------
   */

  const resetFadeTimer = () => {
    setShowControls(true);

    clearTimeout(hideTimer.current);

    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetFadeTimer();

    return () => {
      clearTimeout(hideTimer.current);
    };
  }, []);

  /*
   * ----------------------------------------------------
   * AUDIO
   * ----------------------------------------------------
   */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !song) {
      setIsPlaying(false);
      return;
    }

    setCurrentTime(0);
    setDuration(0);

    audio.volume = volume;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.warn(
          "RadioPlayer: browser blocked autoplay.",
          error
        );

        setIsPlaying(false);
      }
    };

    playAudio();

    return () => {
      audio.pause();
    };
  }, [song]);

  /*
   * ----------------------------------------------------
   * AUDIO PROGRESS
   * ----------------------------------------------------
   */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener(
      "timeupdate",
      updateProgress
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "durationchange",
      updateDuration
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        updateProgress
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "durationchange",
        updateDuration
      );
    };
  }, [song]);

  /*
   * ----------------------------------------------------
   * AUDIO ERROR
   * ----------------------------------------------------
   */

  const handleAudioError = () => {
    console.error(
      "RadioPlayer: unable to load audio:",
      song?.src
    );

    setIsPlaying(false);
  };

  /*
   * ----------------------------------------------------
   * VOLUME
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /*
   * ----------------------------------------------------
   * FULLSCREEN STATE
   * ----------------------------------------------------
   */

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /*
   * ----------------------------------------------------
   * FULLSCREEN
   * ----------------------------------------------------
   */

  const toggleFullscreen = async () => {
    resetFadeTimer();

    try {
      if (!document.fullscreenElement) {
        await playerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  /*
   * ----------------------------------------------------
   * RANDOM SONG
   * ----------------------------------------------------
   */

  const getRandomSongIndex = () => {
    if (songs.length <= 1) {
      return 0;
    }

    let randomIndex;

    do {
      randomIndex = Math.floor(
        Math.random() * songs.length
      );
    } while (randomIndex === currentSong);

    return randomIndex;
  };

  /*
   * ----------------------------------------------------
   * NEXT SONG
   * ----------------------------------------------------
   */

  const nextSong = () => {
    if (!songs.length) return;

    const nextIndex = getRandomSongIndex();

    setCurrentSong(nextIndex);

    resetFadeTimer();
  };

  /*
   * ----------------------------------------------------
   * PREVIOUS SONG
   * ----------------------------------------------------
   */

  const previousSong = () => {
    if (!songs.length) return;

    const previousIndex = getRandomSongIndex();

    setCurrentSong(previousIndex);

    resetFadeTimer();
  };

  /*
   * ----------------------------------------------------
   * PLAY / PAUSE
   * ----------------------------------------------------
   */

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error(
        "RadioPlayer: playback error:",
        error
      );

      setIsPlaying(false);
    }

    resetFadeTimer();
  };

  /*
   * ----------------------------------------------------
   * VOLUME
   * ----------------------------------------------------
   */

  const handleVolume = (event) => {
    const newVolume = Number(
      event.target.value
    );

    setVolume(newVolume);

    resetFadeTimer();
  };

  /*
   * ----------------------------------------------------
   * PROGRESS SEEK
   * ----------------------------------------------------
   */

  const handleProgressClick = (event) => {
    const audio = audioRef.current;

    if (!audio || !duration) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const clickPosition =
      (event.clientX - rect.left) /
      rect.width;

    const newTime =
      clickPosition * duration;

    audio.currentTime = newTime;

    setCurrentTime(newTime);
  };

  /*
   * ----------------------------------------------------
   * TIME FORMAT
   * ----------------------------------------------------
   */

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "00:00";
    }

    const minutes = Math.floor(time / 60);

    const seconds = Math.floor(
      time % 60
    );

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  /*
   * ----------------------------------------------------
   * KEYBOARD CONTROLS
   * ----------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      resetFadeTimer();

      if (
        event.code === "Space" &&
        event.target.tagName !== "INPUT"
      ) {
        event.preventDefault();

        togglePlay();
      }

      if (event.code === "ArrowRight") {
        nextSong();
      }

      if (event.code === "ArrowLeft") {
        previousSong();
      }

      if (event.code === "KeyF") {
        toggleFullscreen();
      }

      if (event.code === "Escape") {
        if (!document.fullscreenElement) {
          onLeave();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [currentSong, songs.length]);

  /*
   * ----------------------------------------------------
   * PROGRESS
   * ----------------------------------------------------
   */

  const progress =
    duration > 0
      ? Math.min(
          (currentTime / duration) * 100,
          100
        )
      : 0;

  /*
   * ----------------------------------------------------
   * PLAYER
   * ----------------------------------------------------
   */

  return (
    <motion.main
      ref={playerRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black text-[#f5f1e8]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
      onMouseMove={resetFadeTimer}
      onTouchStart={resetFadeTimer}
      onTouchMove={resetFadeTimer}
    >

      {/* ------------------------------------------------ */}
      {/* BACKGROUND IMAGE */}
      {/* ------------------------------------------------ */}

      <img
        src={station.background}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* ------------------------------------------------ */}
      {/* BACKGROUND VIDEO */}
      {/* ------------------------------------------------ */}

      {station.video && (
        <video
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          src={station.video}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* ------------------------------------------------ */}
      {/* ATMOSPHERE */}
      {/* ------------------------------------------------ */}

      <div className="absolute inset-0 z-[2] bg-black/25" />

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/85 via-black/10 to-black/35" />

      {/* ------------------------------------------------ */}
      {/* AUDIO */}
      {/* ------------------------------------------------ */}

      {song && (
        <audio
          ref={audioRef}
          src={song.src}
          preload="auto"
          onEnded={nextSong}
          onError={handleAudioError}
        />
      )}

      {/* ================================================= */}
      {/* PERMANENT SONG PROGRESS */}
      {/* ================================================= */}

      <div
        className="absolute bottom-5 left-1/2 z-20 w-[min(420px,70vw)] -translate-x-1/2"
        onMouseMove={(event) =>
          event.stopPropagation()
        }
      >

        {/* Time */}

        <div className="mb-2 flex justify-between px-1 text-[8px] tracking-[0.18em] text-white/35">
          <span>
            {formatTime(currentTime)}
          </span>

          <span>
            {formatTime(duration)}
          </span>
        </div>

        {/* Progress track */}

        <button
          type="button"
          onClick={handleProgressClick}
          aria-label="Seek through song"
          className="group relative block h-3 w-full cursor-pointer"
        >

          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/20" />

          <span
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-white/75 transition-[width] duration-100"
            style={{
              width: `${progress}%`,
            }}
          />

          <span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-90"
            style={{
              left: `${progress}%`,
            }}
          />

        </button>
      </div>

      {/* ================================================= */}
      {/* FADING CONTROLS */}
      {/* ================================================= */}

      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
            }}
          >

            {/* ------------------------------------------ */}
            {/* LEAVE */}
            {/* ------------------------------------------ */}

            <button
              type="button"
              onClick={onLeave}
              className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-white/65 transition hover:text-white md:left-10 md:top-8"
            >
              ← Leave
            </button>

            {/* ------------------------------------------ */}
            {/* FULLSCREEN */}
            {/* ------------------------------------------ */}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute right-6 top-6 text-[10px] uppercase tracking-[0.3em] text-white/65 transition hover:text-white md:right-10 md:top-8"
            >
              {isFullscreen
                ? "Exit full screen"
                : "Full screen"}
            </button>

            {/* ------------------------------------------ */}
            {/* SONG INFORMATION */}
            {/* ------------------------------------------ */}

            <div className="absolute bottom-12 left-6 max-w-[70vw] md:bottom-12 md:left-10">

              <p className="mb-3 text-[9px] uppercase tracking-[0.35em] text-white/45">
                {station.name}
              </p>

              <h1 className="text-2xl font-normal tracking-[-0.02em] md:text-4xl">
                {song?.title ||
                  "The radio is playing."}
              </h1>

              {song?.artist && (
                <p className="mt-2 text-xs text-white/50">
                  {song.artist}
                </p>
              )}

            </div>

            {/* ------------------------------------------ */}
            {/* PLAYER CONTROLS */}
            {/* ------------------------------------------ */}

            <div className="absolute bottom-12 right-6 flex items-center gap-4 md:right-10 md:gap-6">

              <button
                type="button"
                onClick={previousSong}
                aria-label="Previous song"
                className="text-sm text-white/45 transition hover:text-white"
              >
                ←
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="min-w-[50px] text-[9px] uppercase tracking-[0.25em] text-white/65 transition hover:text-white"
              >
                {isPlaying
                  ? "Pause"
                  : "Play"}
              </button>

              <button
                type="button"
                onClick={nextSong}
                aria-label="Next song"
                className="text-sm text-white/45 transition hover:text-white"
              >
                →
              </button>

              {/* Volume */}

              <div className="ml-2 flex items-center gap-2">

                <span className="hidden text-[8px] uppercase tracking-[0.2em] text-white/30 sm:block">
                  Vol
                </span>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolume}
                  aria-label="Volume"
                  className="w-16 accent-white sm:w-20"
                />

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </motion.main>
  );
}

export default RadioPlayer;