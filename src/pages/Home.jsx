import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { supabase } from "../lib/supabase";

function Home({ stations, onEnterStation, onSurpriseMe }) {
  const [sceneRequest, setSceneRequest] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [message, setMessage] = useState("");
  const [visitorCount, setVisitorCount] = useState(null);

  const stationList = Object.values(stations || {});

  // ============================================================
  // VISITOR COUNT
  // ============================================================

  useEffect(() => {
    const registerVisit = async () => {
      try {
        const sessionKey = "you-just-walked-in-visit";

        // Only count one visit per browser session.
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        if (alreadyCounted) {
          const { data, error } = await supabase
            .from("site_stats")
            .select("visit_count")
            .eq("id", 1)
            .single();

          if (!error && data) {
            setVisitorCount(data.visit_count);
          }

          return;
        }

        // Increment the visitor count.
        const { data, error } = await supabase.rpc(
          "increment_visit_count"
        );

        if (error) {
          console.error("Visitor count error:", error);
          return;
        }

        sessionStorage.setItem(sessionKey, "true");

        setVisitorCount(data);
      } catch (error) {
        console.error("Failed to register visit:", error);
      }
    };

    registerVisit();
  }, []);

  // ============================================================
  // SCENE REQUEST
  // ============================================================

  const handleRequestSubmit = (event) => {
    event.preventDefault();

    if (!sceneRequest.trim()) return;

    setMessage("We'll keep that place in mind.");
    setSceneRequest("");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // ============================================================
  // SPOTIFY REQUEST
  // ============================================================

  const handleSpotifySubmit = (event) => {
    event.preventDefault();

    if (!spotifyLink.trim()) return;

    setMessage("We'll keep that playlist in mind.");
    setSpotifyLink("");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0c0b09] text-[#f5f1e8]">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-7 md:px-10 lg:px-12">

        <p className="text-[9px] uppercase tracking-[0.38em] text-white/45">
          You Just Walked In.
        </p>

        <p className="hidden text-[8px] uppercase tracking-[0.3em] text-white/20 sm:block">
          Somewhere, something is already playing.
        </p>

      </header>


      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="mx-auto w-full max-w-[1440px] px-6 pb-24 pt-24 md:px-10 md:pt-32 lg:px-12 lg:pb-32">

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <p className="mb-7 text-[9px] uppercase tracking-[0.42em] text-white/25">
            Pick a place.
          </p>

          <h1 className="max-w-5xl text-[clamp(4rem,9vw,9rem)] font-normal leading-[0.82] tracking-[-0.065em]">
            Where did
            <br />
            you walk in?
          </h1>

        </motion.div>

      </section>


      {/* ================================================= */}
      {/* SCENE GRID */}
      {/* ================================================= */}

      <section className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-12">

        <div className="grid grid-cols-1 border-l border-t border-white/[0.11] sm:grid-cols-2 lg:grid-cols-3">

          {stationList.map((station, index) => (
            <motion.button
              key={station.id || index}
              type="button"
              onClick={() => onEnterStation(station)}

              initial={{
                opacity: 0,
                y: 20,
              }}

              whileInView={{
                opacity: 1,
                y: 0,
              }}

              viewport={{
                once: true,
                amount: 0.15,
              }}

              transition={{
                duration: 0.7,
                delay: index * 0.05,
              }}

              className="group relative flex min-h-[290px] flex-col justify-between overflow-hidden border-b border-r border-white/[0.11] p-6 text-left transition-colors duration-500 hover:bg-white/[0.025] md:min-h-[340px] md:p-8 lg:p-9"
            >

              {/* ----------------------------------------- */}
              {/* SCENE IMAGE */}
              {/* ----------------------------------------- */}

              {station.background && (
                <div
                  className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center opacity-0 transition-all duration-[1200ms] ease-out group-hover:scale-100 group-hover:opacity-[0.18]"
                  style={{
                    backgroundImage: `url("${station.background}")`,
                  }}
                />
              )}


              {/* ----------------------------------------- */}
              {/* VIDEO ON HOVER */}
              {/* ----------------------------------------- */}

              {station.video && (
                <video
                  src={station.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[1200ms] group-hover:opacity-[0.16]"
                  onMouseEnter={(event) => {
                    event.currentTarget.play().catch(() => {});
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.pause();
                    event.currentTarget.currentTime = 0;
                  }}
                />
              )}


              {/* ----------------------------------------- */}
              {/* ATMOSPHERE */}
              {/* ----------------------------------------- */}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c0b09]/20 via-transparent to-[#0c0b09]/75 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />


              {/* ----------------------------------------- */}
              {/* TOP */}
              {/* ----------------------------------------- */}

              <div className="relative z-10 flex items-start justify-between">

                <span className="text-[8px] uppercase tracking-[0.32em] text-white/25">
                  {station.number ||
                    String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm text-white/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white/75">
                  ↗
                </span>

              </div>


              {/* ----------------------------------------- */}
              {/* CONTENT */}
              {/* ----------------------------------------- */}

              <div className="relative z-10">

                <h2 className="text-2xl font-normal tracking-[-0.025em] md:text-3xl">
                  {station.name}
                </h2>

                {station.shortDescription && (
                  <p className="mt-4 max-w-xs text-xs leading-6 text-white/30 transition-colors duration-500 group-hover:text-white/60">
                    {station.shortDescription}
                  </p>
                )}

              </div>


              {/* ----------------------------------------- */}
              {/* BOTTOM LINE */}
              {/* ----------------------------------------- */}

              <div className="absolute bottom-0 left-0 z-20 h-px w-0 bg-white/60 transition-all duration-700 group-hover:w-full" />

            </motion.button>
          ))}

        </div>


        {/* ================================================= */}
        {/* SURPRISE ME */}
        {/* ================================================= */}

        <div className="flex flex-col gap-5 border-b border-white/[0.11] py-8 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[8px] uppercase tracking-[0.3em] text-white/15">
            Don't know where to go?
          </p>

          <button
            type="button"
            onClick={onSurpriseMe}
            className="group flex items-center gap-3 self-start text-[9px] uppercase tracking-[0.32em] text-white/40 transition-colors duration-300 hover:text-white sm:self-auto"
          >

            <span>
              Surprise me
            </span>

            <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
              ↗
            </span>

          </button>

        </div>

      </section>


      {/* ------------------------------------------------ */}
{/* PEOPLE WALKED IN BEFORE YOU */}
{/* ------------------------------------------------ */}

<section className="mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-12">

  <div className="border-t border-white/[0.12]">

    <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">

      {/* Label */}

      <div className="flex items-start border-b border-white/[0.12] py-8 lg:border-b-0 lg:border-r lg:py-10">

        <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
          People walked in before you
        </p>

      </div>


      {/* Main content */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex flex-col justify-center py-20 lg:px-16 lg:py-24"
      >

        <p className="text-[clamp(5rem,12vw,11rem)] font-normal leading-[0.8] tracking-[-0.07em] text-white">
  {visitorCount === null
    ? "—"
    : visitorCount.toLocaleString()}
</p>

        <div className="mt-10 max-w-xl">

          <h2 className="text-3xl font-normal leading-[1] tracking-[-0.035em] md:text-5xl">
            people have already
            <br />
            walked in.
          </h2>

          <p className="mt-7 max-w-md text-sm leading-7 text-white/40">
            They came looking for somewhere to go.
            Maybe they stayed for a song. Maybe they
            found a memory they didn't know they had.
          </p>

        </div>

        <div className="mt-14 flex items-center gap-4">

          <span className="h-px w-12 bg-white/20" />

          <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
            Somewhere, someone is already listening.
          </p>

        </div>

      </motion.div>

    </div>

  </div>

</section>

      {/* ================================================= */}
      {/* CONTRIBUTION */}
      {/* ================================================= */}

      <section className="mx-auto w-full max-w-[1440px] px-6 py-28 md:px-10 lg:px-12 lg:py-40">

        <div className="grid gap-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-32">

          {/* --------------------------------------------- */}
          {/* LEFT */}
          {/* --------------------------------------------- */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
            }}
          >

            <p className="mb-7 text-[9px] uppercase tracking-[0.42em] text-white/25">
              There's always another place.
            </p>

            <h2 className="max-w-3xl text-4xl font-normal leading-[0.92] tracking-[-0.045em] md:text-6xl lg:text-7xl">
              Don't see somewhere
              <br />
              you'd like to be?
            </h2>

            <p className="mt-9 max-w-lg text-sm leading-7 text-white/35">
              Maybe it's a place only you know.
              The last bus home. A chai stall that
              never seems to close. A railway platform
              at midnight.
            </p>

          </motion.div>


          {/* --------------------------------------------- */}
          {/* RIGHT */}
          {/* --------------------------------------------- */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
            className="lg:pt-16"
          >

            {/* ----------------------------------------- */}
            {/* SCENERY REQUEST */}
            {/* ----------------------------------------- */}

            <form
              onSubmit={handleRequestSubmit}
              className="border-b border-white/[0.14] pb-8"
            >

              <label
                htmlFor="scene-request"
                className="mb-5 block text-[8px] uppercase tracking-[0.4em] text-white/25"
              >
                Tell us where to go
              </label>

              <div className="flex items-end gap-5">

                <input
                  id="scene-request"
                  type="text"
                  value={sceneRequest}
                  onChange={(event) =>
                    setSceneRequest(event.target.value)
                  }
                  placeholder="A place you'd like to walk into..."
                  className="min-w-0 flex-1 border-0 border-b border-white/[0.1] bg-transparent pb-3 text-sm text-white outline-none placeholder:text-white/20 transition-colors focus:border-white/40"
                />

                <button
                  type="submit"
                  aria-label="Submit scenery suggestion"
                  className="pb-3 text-sm text-white/30 transition hover:text-white"
                >
                  ↗
                </button>

              </div>

            </form>


            {/* ----------------------------------------- */}
            {/* SPOTIFY */}
            {/* ----------------------------------------- */}

            <form
              onSubmit={handleSpotifySubmit}
              className="mt-12 border-b border-white/[0.14] pb-8"
            >

              <label
                htmlFor="spotify-link"
                className="mb-5 block text-[8px] uppercase tracking-[0.4em] text-white/25"
              >
                Have a playlist that belongs here?
              </label>

              <div className="flex items-end gap-5">

                <input
                  id="spotify-link"
                  type="url"
                  value={spotifyLink}
                  onChange={(event) =>
                    setSpotifyLink(event.target.value)
                  }
                  placeholder="Leave your Spotify link..."
                  className="min-w-0 flex-1 border-0 border-b border-white/[0.1] bg-transparent pb-3 text-sm text-white outline-none placeholder:text-white/20 transition-colors focus:border-white/40"
                />

                <button
                  type="submit"
                  aria-label="Submit Spotify playlist"
                  className="pb-3 text-sm text-white/30 transition hover:text-white"
                >
                  ↗
                </button>

              </div>

            </form>


            {/* ----------------------------------------- */}
            {/* MESSAGE */}
            {/* ----------------------------------------- */}

            <div className="min-h-8 pt-5">

              {message && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="text-[8px] uppercase tracking-[0.3em] text-white/40"
                >
                  {message}
                </motion.p>
              )}

            </div>

          </motion.div>

        </div>

      </section>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 border-t border-white/[0.11] px-6 py-9 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">

        <p className="text-[8px] uppercase tracking-[0.32em] text-white/20">
          You Just Walked In.
        </p>


        <a
          href={import.meta.env.VITE_GITHUB_REPO_URL || "#"}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3 text-[8px] uppercase tracking-[0.32em] text-white/25 transition hover:text-white"
        >

          <span>
            If you liked the ride, leave a star.
          </span>

          <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>

        </a>


        <p className="text-[8px] uppercase tracking-[0.3em] text-white/15">
          2026
        </p>

      </footer>


      <div className="h-8" />

    </main>
  );
}

export default Home;