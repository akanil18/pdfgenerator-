import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Loader2, Trash2, CheckCircle, Sparkles } from "lucide-react";

/**
 * ConvertButton + Clear button row with rich animations.
 */
export default function ConvertButton({
  onConvert,
  onClear,
  loading,
  progress,
  disabled,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 flex flex-col sm:flex-row items-center gap-4"
    >
      {/* Convert button */}
      <motion.button
        whileHover={
          !disabled && !loading
            ? { scale: 1.04, boxShadow: "0 20px 40px rgba(124,58,237,0.3)" }
            : {}
        }
        whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
        onClick={onConvert}
        disabled={disabled || loading}
        className={`
          relative overflow-hidden w-full sm:w-auto
          flex items-center justify-center gap-2.5
          px-10 py-4 rounded-2xl font-bold text-white text-sm
          transition-all duration-500 shadow-lg
          ${
            disabled || loading
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:shadow-violet-300 hover:shadow-2xl"
          }
        `}
      >
        {/* Animated shimmer effect */}
        {!disabled && !loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Progress bar underlay */}
        {loading && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-2xl"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 relative z-10"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Converting… {progress > 0 && `${progress}%`}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 relative z-10"
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileDown className="w-5 h-5" />
              </motion.div>
              Convert to PDF
              <Sparkles className="w-4 h-4 opacity-70" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Clear all */}
      <AnimatePresence>
        {!loading && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ scale: 1.04, backgroundColor: "#FEF2F2" }}
            whileTap={{ scale: 0.96 }}
            onClick={onClear}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-sm
              border-2 transition-all duration-300
              ${
                disabled
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-red-200 text-red-500 hover:border-red-300 hover:shadow-lg hover:shadow-red-50"
              }
            `}
          >
            <motion.div
              whileHover={{ rotate: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.div>
            Clear All
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
