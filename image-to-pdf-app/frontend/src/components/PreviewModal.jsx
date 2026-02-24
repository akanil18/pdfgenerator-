import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, RotateCw } from "lucide-react";

/**
 * Full-screen lightbox for previewing a single image.
 */
export default function PreviewModal({
    open,
    src,
    name,
    rotation,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
}) {
    const handleKey = useCallback(
        (e) => {
            if (!open) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft" && hasPrev) onPrev();
            if (e.key === "ArrowRight" && hasNext) onNext();
        },
        [open, hasPrev, hasNext, onClose, onPrev, onNext]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
                    />

                    {/* Lightbox */}
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-4">
                        {/* Top bar */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="pointer-events-auto w-full max-w-5xl flex items-center justify-between mb-4 px-2"
                        >
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2">
                                <ZoomIn className="w-4 h-4 text-white/70" />
                                <span className="text-sm text-white/80 font-medium truncate max-w-xs">{name}</span>
                                {rotation !== 0 && (
                                    <span className="flex items-center gap-1 text-red-300 text-xs font-semibold">
                                        <RotateCw className="w-3 h-3" />
                                        {rotation}°
                                    </span>
                                )}
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.15, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                className="pointer-events-auto p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>
                        </motion.div>

                        {/* Image container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ type: "spring", stiffness: 280, damping: 24 }}
                            className="pointer-events-auto relative flex items-center justify-center w-full max-w-5xl"
                            style={{ maxHeight: "75vh" }}
                        >
                            {/* Prev */}
                            {hasPrev && (
                                <motion.button
                                    onClick={onPrev}
                                    whileHover={{ scale: 1.1, x: -3 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute left-0 -translate-x-14 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </motion.button>
                            )}

                            {/* Image */}
                            <motion.img
                                key={src + rotation}
                                src={src}
                                alt={name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    maxHeight: "72vh",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    borderRadius: "16px",
                                    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
                                    transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                                }}
                                draggable={false}
                            />

                            {/* Next */}
                            {hasNext && (
                                <motion.button
                                    onClick={onNext}
                                    whileHover={{ scale: 1.1, x: 3 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute right-0 translate-x-14 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10 backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </motion.button>
                            )}
                        </motion.div>

                        {/* Navigation hint */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3 }}
                            className="pointer-events-none mt-5 text-xs text-white/40"
                        >
                            {hasPrev || hasNext
                                ? "Use ← → arrow keys or buttons to navigate • Esc to close"
                                : "Press Esc to close"}
                        </motion.p>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
