import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImagePlus, AlertCircle, UploadCloud } from "lucide-react";

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/bmp": [".bmp"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff"],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/* Floating particle dots for the upload zone background */
function FloatingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-red-300/30"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

export default function UploadZone({ onFilesAdded }) {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length) {
        const msg = rejected
          .map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(", ")}`)
          .join("\n");
        alert(`Some files were rejected:\n${msg}`);
      }
      if (accepted.length) onFilesAdded(accepted);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer overflow-hidden
          rounded-2xl border-2 border-dashed transition-all duration-500
          ${isDragReject
            ? "border-red-400 bg-red-50 shadow-lg shadow-red-100"
            : isDragActive
              ? "border-red-400 bg-red-50/60 scale-[1.02] shadow-xl shadow-red-100"
              : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/20 hover:shadow-lg hover:shadow-red-50"
          }
        `}
      >
        {/* Animated gradient blobs */}
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-red-200/20 to-rose-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-red-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating dots */}
        <FloatingDots />

        <input {...getInputProps()} />

        <div className="relative flex flex-col items-center justify-center gap-5 py-20 px-6">
          <AnimatePresence mode="wait">
            {isDragReject ? (
              <motion.div
                key="reject"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 30 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="p-5 rounded-2xl bg-red-100 shadow-lg shadow-red-100"
              >
                <AlertCircle className="w-12 h-12 text-red-500" />
              </motion.div>
            ) : isDragActive ? (
              <motion.div
                key="active"
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1.15, y: 0 }}
                exit={{ scale: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="p-5 rounded-2xl bg-red-100 shadow-lg shadow-red-100"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ImagePlus className="w-12 h-12 text-red-600" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                whileHover={{ scale: 1.08, rotate: 3 }}
                className="relative p-5 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 shadow-lg shadow-red-100/50"
              >
                <UploadCloud className="w-12 h-12 text-red-600" />
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-red-300/50"
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center">
            <motion.p
              className="text-lg font-semibold text-gray-700"
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            >
              {isDragReject
                ? "Unsupported file type!"
                : isDragActive
                  ? "Drop your images here…"
                  : "Drag & drop images here"}
            </motion.p>
            <p className="mt-1.5 text-sm text-gray-400">
              or{" "}
              <motion.span
                className="text-red-600 font-medium underline underline-offset-2 cursor-pointer"
                whileHover={{ color: "#dc2626" }}
              >
                browse files
              </motion.span>
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-full px-4 py-1.5 inline-block"
            >
              Supports JPG, PNG, BMP, GIF, WEBP, TIFF — Max 10 MB each
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
