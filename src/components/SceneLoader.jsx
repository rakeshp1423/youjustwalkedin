import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SceneLoader({ station, onComplete }) {
  const [storyIndex, setStoryIndex] = useState(-1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!station) return;

    setStoryIndex(-1);
    setFinished(false);

    const startTimer = setTimeout(() => {
      setStoryIndex(0);
    }, 900);

    return () => clearTimeout(startTimer);
  }, [station]);

  useEffect(() => {
    if (!station || storyIndex < 0) return;

    if (storyIndex >= station.story.length) {
      const endingTimer = setTimeout(() => {
        setFinished(true);
      }, 1300);

      return () => clearTimeout(endingTimer);
    }

    const timer = setTimeout(() => {
      setStoryIndex((current) => current + 1);
    }, 2100);

    return () => clearTimeout(timer);
  }, [storyIndex, station]);

  useEffect(() => {
    if (!finished) return;

    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [finished, onComplete]);

  if (!station) return null;

  const currentStory =
    storyIndex >= 0 && storyIndex < station.story.length
      ? station.story[storyIndex]
      : null;

  const progress =
    station.story.length > 0
      ? Math.min(
          ((storyIndex + 1) / station.story.length) * 100,
          100
        )
      : 0;

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#0c0b09] text-[#f5f1e8]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
    >
      {/* ---------------------------------------------- */}
      {/* BACKGROUND */}
      {/* ---------------------------------------------- */}

      {station.video ? (
        <video
          src={station.video}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : station.background ? (
        <img
          src={station.background}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : null}

      {/* ---------------------------------------------- */}
      {/* ATMOSPHERE */}
      {/* ---------------------------------------------- */}

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/75" />

      {/* ---------------------------------------------- */}
      {/* CONTENT */}
      {/* ---------------------------------------------- */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 md:px-10">

        <div className="w-full max-w-3xl text-center">

          {/* Scene name */}

          <motion.p
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              delay: 0.2,
            }}
            className="mb-12 text-[9px] uppercase tracking-[0.45em] text-white/40"
          >
            {station.name}
          </motion.p>


          {/* ------------------------------------------ */}
          {/* STORY */}
          {/* ------------------------------------------ */}

          <div className="relative flex min-h-[150px] items-center justify-center">

            <AnimatePresence mode="wait">

              {!finished && currentStory && (
                <motion.p
                  key={currentStory}
                  initial={{
                    opacity: 0,
                    y: 18,
                    filter: "blur(4px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -18,
                    filter: "blur(4px)",
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="max-w-2xl text-2xl font-normal leading-relaxed tracking-[-0.025em] md:text-4xl"
                >
                  {currentStory}
                </motion.p>
              )}


              {/* -------------------------------------- */}
              {/* ENDING */}
              {/* -------------------------------------- */}

              {finished && (
                <motion.div
                  key="ending"
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                >

                  <p className="text-2xl italic leading-relaxed text-white/80 md:text-4xl">
                    {station.ending}
                  </p>

                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 1,
                      duration: 1,
                    }}
                    className="mt-8 text-[9px] uppercase tracking-[0.4em] text-white/35"
                  >
                    The radio is already playing.
                  </motion.p>

                </motion.div>
              )}

            </AnimatePresence>

          </div>


          {/* ------------------------------------------ */}
          {/* PROGRESS */}
          {/* ------------------------------------------ */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1,
              duration: 1,
            }}
            className="mx-auto mt-16 h-px w-24 overflow-hidden bg-white/10"
          >

            <motion.div
              className="h-full bg-white/45"
              initial={{
                width: "0%",
              }}
              animate={{
                width: finished
                  ? "100%"
                  : `${progress}%`,
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
              }}
            />

          </motion.div>


          {/* ------------------------------------------ */}
          {/* SCENE NUMBER */}
          {/* ------------------------------------------ */}

          <p className="mt-5 text-[8px] uppercase tracking-[0.35em] text-white/20">
            {station.number || "01"}
          </p>

        </div>

      </div>


      {/* ---------------------------------------------- */}
      {/* FADE OUT BEFORE PLAYER */}
      {/* ---------------------------------------------- */}

      {finished && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-black"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0, 1],
          }}
          transition={{
            duration: 2.2,
            times: [0, 0.65, 1],
            ease: "easeInOut",
          }}
        />
      )}

    </motion.div>
  );
}

export default SceneLoader;