import { motion } from "framer-motion";

function SceneCard({ station, index, onEnter }) {
  return (
    <motion.button
      onClick={() => onEnter(station)}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover="hover"
      className="group relative min-h-[480px] w-full overflow-hidden border border-white/10 text-left md:min-h-[600px]"
    >
      {/* Background */}
      <motion.img
        src={station.background}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        variants={{
          hover: {
            opacity: 1,
            scale: 1.04,
          },
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
      />

      {/* Base */}
      <div className="absolute inset-0 bg-[#0c0b09]" />

      {/* Image overlay */}
      <motion.div
        className="absolute inset-0 bg-black/35"
        initial={{ opacity: 0 }}
        variants={{
          hover: {
            opacity: 1,
          },
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-7 md:p-10">

        {/* Top */}
        <div className="flex items-start justify-between">
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/30">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span className="translate-x-0 text-[9px] uppercase tracking-[0.3em] text-white/25 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white/70">
            Enter →
          </span>
        </div>

        {/* Bottom */}
        <div>
          <p className="mb-5 text-[9px] uppercase tracking-[0.35em] text-white/35">
            {station.shortDescription}
          </p>

          <h2 className="text-4xl font-normal tracking-[-0.02em] text-[#f5f1e8] md:text-6xl">
            {station.name}
          </h2>

          <div className="mt-7 max-w-lg space-y-1 text-sm leading-7 text-white/50 opacity-70 transition-all duration-700 group-hover:text-white/70 group-hover:opacity-100">
            {station.story.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <p className="mt-7 text-xs italic text-white/35 transition-colors duration-700 group-hover:text-white/55">
            {station.ending}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default SceneCard;