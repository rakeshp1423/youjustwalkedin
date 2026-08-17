import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function RadioPlayer({ station, onLeave }) {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const hideTimer = useRef(null);

  const [currentSong, setCurrentSong] = useState(0);
  const [volume, setVolume] = useState(0.75);

  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const songs = station?.songs || [];
  const song = songs[currentSong];

  /*
   * ============================================================
   * CONTROL FADE
   * ============================================================
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
   * ============================================================
   * LOAD + PLAY SONG
   * ============================================================
   */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !song) {
      setIsPlaying(false);
      return;
    }

    audio.pause();

    audio.currentTime = 0;
    audio.volume = volume;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    const handleMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        /*
         * Browsers may block autoplay until the user interacts
         * with the page. This is normal browser behaviour.
         */
        console.warn("Autoplay was blocked:", error);
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      if (!songs.length) return;

      setCurrentSong((current) => {
        if (current >= songs.length - 1) {
          return 0;
        }

        return current + 1;
      });
    };

    const handleError = () => {
      console.error(
        `RadioPlayer: failed to load "${song.src}"`
      );

      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    /*
     * Force the browser to load the new source.
     */
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [song, songs.length]);

  /*
   * ============================================================
   * VOLUME
   * ============================================================
   */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /*
   * ============================================================
   * FULLSCREEN STATE
   * ============================================================
   */

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
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
   * ============================================================
   * FULLSCREEN
   * ============================================================
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
      console.error("Fullscreen error:", error);
    }
  };

  /*
   * ============================================================
   * VOLUME
   * ============================================================
   */

  const handleVolume = (event) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);
    resetFadeTimer();
  };

  /*
   * ============================================================
   * PROGRESS SEEK
   * ============================================================
   */

  const handleProgressClick = (event) => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const clickPosition =
      (event.clientX - rect.left) / rect.width;

    const newTime =
      Math.max(0, Math.min(clickPosition, 1)) *
      audio.duration;

    audio.currentTime = newTime;

    setCurrentTime(newTime);

    resetFadeTimer();
  };

  /*
   * ============================================================
   * TIME FORMAT
   * ============================================================
   */

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  /*
   * ============================================================
   * KEYBOARD
   * ============================================================
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      resetFadeTimer();

      if (event.code === "KeyF") {
        toggleFullscreen();
      }

      if (event.code === "Escape") {
        if (!document.fullscreenElement) {
          onLeave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /*
   * ============================================================
   * PROGRESS
   * ============================================================
   */

  const progress =
    duration > 0
      ? Math.min((currentTime / duration) * 100, 100)
      : 0;

  /*
   * ============================================================
   * PLAYER
   * ============================================================
   */

  return (
    <motion.main
      ref={playerRef}
      className="fixed inset-0 z-[100] h-[100dvh] w-full overflow-hidden bg-black text-[#f5f1e8]"
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
      {/* ====================================================== */}
      {/* BACKGROUND IMAGE */}
      {/* ====================================================== */}

      <img
        src={station.background}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* ====================================================== */}
      {/* BACKGROUND VIDEO */}
      {/* ====================================================== */}

      {station.video && (
        <video
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          src={station.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* ====================================================== */}
      {/* ATMOSPHERE */}
      {/* ====================================================== */}

      <div className="absolute inset-0 z-[2] bg-black/25" />

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/90 via-black/10 to-black/35" />

      {/* ====================================================== */}
      {/* AUDIO */}
      {/* ====================================================== */}

      {song && (
        <audio
          ref={audioRef}
          src={song.src}
          preload="auto"
        />
      )}

      {/* ====================================================== */}
      {/* PERMANENT SONG PROGRESS */}
      {/* ====================================================== */}

      <div
        className="absolute bottom-5 left-1/2 z-30 w-[min(420px,calc(100vw-48px))] -translate-x-1/2"
        onMouseMove={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <div className="mb-2 flex justify-between px-1 text-[8px] tracking-[0.18em] text-white/40">
          <span>{formatTime(currentTime)}</span>

          <span>{formatTime(duration)}</span>
        </div>

        <button
          type="button"
          onClick={handleProgressClick}
          aria-label="Seek through song"
          className="group relative block h-4 w-full cursor-pointer"
        >
          {/* Track */}

          <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/20" />

          {/* Played */}

          <span
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-white/80"
            style={{
              width: `${progress}%`,
            }}
          />

          {/* Position */}

          <span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{
              left: `${progress}%`,
            }}
          />
        </button>
      </div>

      {/* ====================================================== */}
      {/* FADING CONTROLS */}
      {/* ====================================================== */}

      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
            }}
          >
            {/* ================================================= */}
            {/* LEAVE */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={onLeave}
              className="absolute left-5 top-5 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:left-8 sm:top-7 md:left-10 md:top-8"
            >
              ← Leave
            </button>

            {/* ================================================= */}
            {/* FULLSCREEN */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute right-5 top-5 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-white sm:right-8 sm:top-7 md:right-10 md:top-8"
            >
              {isFullscreen
                ? "Exit full screen"
                : "Full screen"}
            </button>

            {/* ================================================= */}
            {/* SONG INFORMATION */}
            {/* ================================================= */}

            <div className="absolute bottom-16 left-5 max-w-[70vw] sm:left-8 md:bottom-14 md:left-10">
              <p className="mb-3 text-[8px] uppercase tracking-[0.35em] text-white/50 sm:text-[9px]">
                {station.name}
              </p>

              <h1 className="text-xl font-normal leading-tight tracking-[-0.02em] sm:text-2xl md:text-4xl">
                {song?.title ||
                  "The radio is playing."}
              </h1>

              {song?.artist && (
                <p className="mt-2 text-xs text-white/50">
                  {song.artist}
                </p>
              )}
            </div>

            {/* ================================================= */}
            {/* VOLUME */}
            {/* ================================================= */}

            <div className="absolute bottom-16 right-5 flex items-center gap-2 sm:right-8 md:bottom-14 md:right-10">
              <span className="hidden text-[8px] uppercase tracking-[0.2em] text-white/35 sm:block">
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
                className="h-1 w-16 cursor-pointer accent-white sm:w-20 md:w-24"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

export default RadioPlayer;