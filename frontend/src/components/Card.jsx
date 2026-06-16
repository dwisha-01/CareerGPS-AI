import { motion } from "framer-motion";

export default function Card({ title, children, className = "", onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, borderColor: "rgba(168, 85, 247, 0.4)" } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-purple-500/10 hover:shadow-2xl" : ""
      } ${className}`}
    >
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      {title && (
        <h2 className="text-white text-lg font-bold tracking-tight mb-4 border-b border-white/5 pb-2">
          {title}
        </h2>
      )}
      <div className="text-slate-300 text-sm leading-relaxed">{children}</div>
    </motion.div>
  );
}