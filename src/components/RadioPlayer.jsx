import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function RadioPlayer({ station, onLeave }) {
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const sleepTimerRef = useRef(null);

  /*
   * ----------------------------------------------------
   * SONG
   * ----------------------------------------------------
   */

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

  /*
   * ----------------------------------------------------
   * SETTINGS
   * ----------------------------------------------------
   */

  const [showSettings, setShowSettings] = useState(false);

  const [sleepTimer, setSleepTimer] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  const [showClock, setShowClock] = useState(true);
  const [currentClock, setCurrentClock] = useState(new Date());

  const [backgroundVideo, setBackgroundVideo] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);

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

    const randomIndex = Math.floor(
      Math.random() * stationSongs.length
    );

    setCurrentSong(randomIndex);
  }, [station]);

  /*
   * ----------------------------------------------------
   * CONTROL FADE
   * ----------------------------------------------------
   *
   * Settings panel is intentionally NOT part of this.
   * The normal player controls can fade.
   * Settings stays open until manually closed.
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
   * CLOCK
   * ----------------------------------------------------
   */

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentClock(new Date());
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  const formatClock = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  /*
   * ----------------------------------------------------
   * SLEEP TIMER
   * ----------------------------------------------------
   */

  const clearSleepTimer = () => {
    clearInterval(
      sleepTimerRef.current
    );

    sleepTimerRef.current = null;

    setSleepTimer(0);
    setSleepRemaining(0);
  };

  const startSleepTimer = (minutes) => {
    clearInterval(
      sleepTimerRef.current
    );

    if (!minutes) {
      clearSleepTimer();
      return;
    }

    const seconds = minutes * 60;

    setSleepTimer(minutes);
    setSleepRemaining(seconds);

    sleepTimerRef.current = setInterval(() => {
      setSleepRemaining((previous) => {
        if (previous <= 1) {
          clearInterval(
            sleepTimerRef.current
          );

          sleepTimerRef.current = null;

          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime =
              audioRef.current.currentTime;
          }

          setIsPlaying(false);
          setSleepTimer(0);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearInterval(
        sleepTimerRef.current
      );
    };
  }, []);

  const formatSleepTime = (seconds) => {
    if (!seconds || seconds <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * ----------------------------------------------------
   * BACKGROUND VIDEO
   * ----------------------------------------------------
   */

  useEffect(() => {
    if (!videoRef.current) return;

    if (backgroundVideo) {
      videoRef.current
        .play()
        .catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [backgroundVideo]);

  /*
   * ----------------------------------------------------
   * KEYBOARD CONTROLS
   * ----------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "SELECT" ||
        event.target.tagName === "BUTTON"
      ) {
        return;
      }

      resetFadeTimer();

      if (event.code === "Space") {
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
        if (showSettings) {
          setShowSettings(false);
          return;
        }

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
  }, [
    currentSong,
    songs.length,
    showSettings,
  ]);

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
   * MOTION SETTINGS
   * ----------------------------------------------------
   */

  const motionDuration =
    reducedMotion ? 0 : 0.45;

  const playerDuration =
    reducedMotion ? 0 : 1.2;

  /*
   * ----------------------------------------------------
   * PLAYER
   * ----------------------------------------------------
   */

  return (
    <motion.main
      ref={playerRef}
      className="fixed inset-0 z-[100] overflow-hidden bg-black text-[#f5f1e8]"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: playerDuration,
        ease: "easeOut",
      }}
      onMouseMove={() => {
        if (!showSettings) {
          resetFadeTimer();
        }
      }}
      onTouchStart={() => {
        if (!showSettings) {
          resetFadeTimer();
        }
      }}
      onTouchMove={() => {
        if (!showSettings) {
          resetFadeTimer();
        }
      }}
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

      {station.video &&
        backgroundVideo && (
          <video
            ref={videoRef}
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
      {/* CLOCK */}
      {/* ================================================= */}

      {showClock && (
        <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2 text-[9px] tracking-[0.25em] text-white/35 md:top-8">
          {formatClock(currentClock)}
        </div>
      )}

      {/* ================================================= */}
      {/* PERMANENT SONG PROGRESS */}
      {/* ================================================= */}

      <div
        className="absolute bottom-5 left-1/2 z-20 w-[min(420px,70vw)] -translate-x-1/2"
        onMouseMove={(event) =>
          event.stopPropagation()
        }
        onTouchMove={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mb-2 flex justify-between px-1 text-[8px] tracking-[0.18em] text-white/35">
          <span>
            {formatTime(currentTime)}
          </span>

          <span>
            {formatTime(duration)}
          </span>
        </div>

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
      {/* SETTINGS BUTTON — ALWAYS AVAILABLE */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => {
          setShowSettings(
            (previous) => !previous
          );

          setShowControls(true);
        }}
        aria-label="Open settings"
        aria-expanded={showSettings}
        className="absolute right-6 top-6 z-40 text-lg leading-none text-white/50 transition hover:text-white md:right-10 md:top-7"
      >
        ⚙
      </button>

      {/* ================================================= */}
      {/* SETTINGS DRAWER */}
      {/* ================================================= */}

      <AnimatePresence>
        {showSettings && (
          <>
            {/* BACKDROP */}

            <motion.div
              className="absolute inset-0 z-30 bg-black/10"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: reducedMotion
                  ? 0
                  : 0.25,
              }}
              onClick={() =>
                setShowSettings(false)
              }
            />

            {/* DRAWER */}

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                duration: reducedMotion
                  ? 0
                  : 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              onMouseMove={(event) =>
                event.stopPropagation()
              }
              onTouchMove={(event) =>
                event.stopPropagation()
              }
              className="absolute right-0 top-0 z-40 flex h-full w-[min(380px,88vw)] flex-col border-l border-white/10 bg-black/55 shadow-2xl backdrop-blur-2xl"
            >
              {/* DRAWER HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
                    Player
                  </p>

                  <h2 className="mt-1 text-sm font-normal text-white/85">
                    Settings
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowSettings(false)
                  }
                  className="text-lg text-white/35 transition hover:text-white"
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>

              {/* DRAWER CONTENT */}

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* CLOCK */}

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/75">
                        Clock
                      </p>

                      <p className="mt-1 text-[9px] text-white/30">
                        Show the current time
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowClock(
                          (previous) =>
                            !previous
                        )
                      }
                      className={`relative h-5 w-9 rounded-full border transition ${
                        showClock
                          ? "border-white/40 bg-white/20"
                          : "border-white/15 bg-white/5"
                      }`}
                      aria-label="Toggle clock"
                      aria-pressed={
                        showClock
                      }
                    >
                      <span
                        className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-all ${
                          showClock
                            ? "left-[18px]"
                            : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>

                  {showClock && (
                    <p className="mt-3 text-[10px] tracking-[0.2em] text-white/40">
                      {formatClock(
                        currentClock
                      )}
                    </p>
                  )}
                </div>

                <div className="mb-6 h-px bg-white/10" />

                {/* SLEEP TIMER */}

                <div className="mb-6">
                  <div className="mb-3">
                    <p className="text-xs text-white/75">
                      Sleep timer
                    </p>

                    <p className="mt-1 text-[9px] text-white/30">
                      Stop playback automatically
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[15, 30, 45].map(
                      (minutes) => (
                        <button
                          key={minutes}
                          type="button"
                          onClick={() =>
                            startSleepTimer(
                              minutes
                            )
                          }
                          className={`rounded-md border px-2 py-2 text-[9px] tracking-[0.08em] transition ${
                            sleepTimer ===
                            minutes
                              ? "border-white/35 bg-white/15 text-white"
                              : "border-white/10 bg-white/5 text-white/45 hover:border-white/25 hover:text-white/80"
                          }`}
                        >
                          {minutes} min
                        </button>
                      )
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        startSleepTimer(60)
                      }
                      className={`rounded-md border px-2 py-2 text-[9px] tracking-[0.08em] transition ${
                        sleepTimer === 60
                          ? "border-white/35 bg-white/15 text-white"
                          : "border-white/10 bg-white/5 text-white/45 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      60 min
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        clearSleepTimer()
                      }
                      className={`rounded-md border px-2 py-2 text-[9px] tracking-[0.08em] transition ${
                        sleepTimer === 0
                          ? "border-white/35 bg-white/15 text-white"
                          : "border-white/10 bg-white/5 text-white/45 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      Off
                    </button>
                  </div>

                  {sleepRemaining > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">
                        Stops in
                      </span>

                      <span className="font-mono text-xs text-white/70">
                        {formatSleepTime(
                          sleepRemaining
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-6 h-px bg-white/10" />

                {/* BACKGROUND VIDEO */}

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/75">
                        Background video
                      </p>

                      <p className="mt-1 text-[9px] text-white/30">
                        Show the moving scene
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setBackgroundVideo(
                          (previous) =>
                            !previous
                        )
                      }
                      className={`relative h-5 w-9 rounded-full border transition ${
                        backgroundVideo
                          ? "border-white/40 bg-white/20"
                          : "border-white/15 bg-white/5"
                      }`}
                      aria-label="Toggle background video"
                      aria-pressed={
                        backgroundVideo
                      }
                    >
                      <span
                        className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-all ${
                          backgroundVideo
                            ? "left-[18px]"
                            : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* REDUCED MOTION */}

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/75">
                        Reduced motion
                      </p>

                      <p className="mt-1 max-w-[210px] text-[9px] leading-relaxed text-white/30">
                        Reduce interface
                        transitions and movement
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReducedMotion(
                          (previous) =>
                            !previous
                        )
                      }
                      className={`relative h-5 w-9 shrink-0 rounded-full border transition ${
                        reducedMotion
                          ? "border-white/40 bg-white/20"
                          : "border-white/15 bg-white/5"
                      }`}
                      aria-label="Toggle reduced motion"
                      aria-pressed={
                        reducedMotion
                      }
                    >
                      <span
                        className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-all ${
                          reducedMotion
                            ? "left-[18px]"
                            : "left-[3px]"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* DRAWER FOOTER */}

              <div className="border-t border-white/10 px-6 py-4">
                <p className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                  You Just Walked In
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================================================= */}
      {/* FADING PLAYER CONTROLS */}
      {/* ================================================= */}

      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: motionDuration,
            }}
          >
            {/* LEAVE */}

            <button
              type="button"
              onClick={onLeave}
              className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-white/65 transition hover:text-white md:left-10 md:top-8"
            >
              ← Leave
            </button>

            {/* FULLSCREEN */}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute right-16 top-6 text-[10px] uppercase tracking-[0.3em] text-white/65 transition hover:text-white sm:right-20 md:right-24 md:top-8"
            >
              {isFullscreen
                ? "Exit full screen"
                : "Full screen"}
            </button>

            {/* SLEEP TIMER INDICATOR */}

            {sleepRemaining > 0 && (
              <div className="absolute left-6 top-14 flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white/35 md:left-10 md:top-16">
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />

                Sleep{" "}
                {formatSleepTime(
                  sleepRemaining
                )}
              </div>
            )}

            {/* SONG INFORMATION */}

            <div className="absolute bottom-12 left-6 max-w-[65vw] md:bottom-12 md:left-10 md:max-w-[55vw]">
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

            {/* PLAYER CONTROLS */}

            <div className="absolute bottom-12 right-6 flex max-w-[45vw] items-center gap-3 md:right-10 md:gap-6">
              {/* PREVIOUS */}

              <button
                type="button"
                onClick={previousSong}
                aria-label="Previous song"
                className="text-sm text-white/45 transition hover:text-white"
              >
                ←
              </button>

              {/* PLAY */}

              <button
                type="button"
                onClick={togglePlay}
                className="min-w-[50px] text-[9px] uppercase tracking-[0.25em] text-white/65 transition hover:text-white"
              >
                {isPlaying
                  ? "Pause"
                  : "Play"}
              </button>

              {/* NEXT */}

              <button
                type="button"
                onClick={nextSong}
                aria-label="Next song"
                className="text-sm text-white/45 transition hover:text-white"
              >
                →
              </button>

              {/* VOLUME */}

              <div className="ml-1 hidden items-center gap-2 sm:flex md:ml-2">
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
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

            {/* MOBILE VOLUME */}

            <div className="absolute bottom-24 right-6 flex items-center gap-2 sm:hidden">
              <span className="text-[8px] uppercase tracking-[0.15em] text-white/30">
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
                className="w-20 accent-white"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

export default RadioPlayer;