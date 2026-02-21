import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import {
  Shield,
  Zap,
  Layers,
  ArrowDown,
  CheckCircle,
  FileText,
  Star,
  Users,
} from "lucide-react";

import UploadZone from "../components/UploadZone";
import ImagePreview from "../components/ImagePreview";
import ConvertButton from "../components/ConvertButton";
import { convertImagesToPdf } from "../services/api";

/* ── Animated background particles ────────────────────── */
function BackgroundParticles() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/40 via-indigo-200/30 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-pink-200/30 via-purple-200/20 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-gradient-to-t from-blue-200/20 to-transparent rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Success confetti burst ───────────────────────────── */
function ConfettiBurst({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -(Math.random() * 300 + 100),
    rotate: Math.random() * 720 - 360,
    color: ["#8b5cf6", "#6366f1", "#a78bfa", "#c084fc", "#818cf8", "#f472b6"][i % 6],
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Stats counter ────────────────────────────────────── */
function AnimatedStat({ icon: Icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-md border border-gray-100/80 hover:shadow-lg hover:border-violet-100 transition-all duration-300"
    >
      <motion.div
        className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100"
        whileHover={{ rotate: 10 }}
      >
        <Icon className="w-5 h-5 text-violet-600" />
      </motion.div>
      <div className="text-left">
        <p className="text-sm font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ done: 0, total: 0 });

  /* ── Image compression options ──────────────────────── */
  const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,            // Compress to max 1 MB per image
    maxWidthOrHeight: 2048,  // Resize if larger than 2048px
    useWebWorker: true,      // Use web worker for non-blocking compression
    fileType: "image/jpeg",  // Output as JPEG for best compression
    initialQuality: 0.85,    // 85% quality — great balance of size vs quality
  };

  /* ── Compress a single image ────────────────────────── */
  const compressImage = async (file) => {
    // Skip compression for small files (< 1 MB) or GIFs
    if (file.size <= 1 * 1024 * 1024 || file.type === "image/gif") {
      return file;
    }

    try {
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      // Preserve original filename with proper extension
      const ext = COMPRESSION_OPTIONS.fileType === "image/jpeg" ? ".jpg" : ".png";
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const renamedFile = new File([compressed], `${baseName}${ext}`, {
        type: compressed.type,
        lastModified: Date.now(),
      });

      const savedPercent = ((1 - renamedFile.size / file.size) * 100).toFixed(0);
      console.log(
        `📦 ${file.name}: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(renamedFile.size / 1024 / 1024).toFixed(1)}MB (${savedPercent}% smaller)`
      );

      return renamedFile;
    } catch (err) {
      console.warn(`Compression failed for ${file.name}, using original:`, err);
      return file; // Fallback to original if compression fails
    }
  };

  /* ── Handlers ───────────────────────────────────────── */

  const handleFilesAdded = useCallback(async (newFiles) => {
    setCompressing(true);
    setCompressionProgress({ done: 0, total: newFiles.length });

    const compressedFiles = [];
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (let i = 0; i < newFiles.length; i++) {
      totalOriginal += newFiles[i].size;
      const compressed = await compressImage(newFiles[i]);
      totalCompressed += compressed.size;
      compressedFiles.push(compressed);
      setCompressionProgress({ done: i + 1, total: newFiles.length });
    }

    setImages((prev) => [...prev, ...compressedFiles]);
    setCompressing(false);

    // Show compression stats in toast
    const savedMB = ((totalOriginal - totalCompressed) / 1024 / 1024).toFixed(1);
    const savedPercent = ((1 - totalCompressed / totalOriginal) * 100).toFixed(0);

    if (totalOriginal > totalCompressed && savedPercent > 5) {
      toast.success(
        `${newFiles.length} image${newFiles.length > 1 ? "s" : ""} added — saved ${savedMB}MB (${savedPercent}% smaller)`,
        { icon: "📦", duration: 3000 }
      );
    } else {
      toast.success(`${newFiles.length} image${newFiles.length > 1 ? "s" : ""} added`, {
        icon: "📸",
      });
    }
  }, []);

  const handleReorder = useCallback((from, to) => {
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const handleRemove = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    toast("Image removed", { icon: "🗑️" });
  }, []);

  const handleClear = useCallback(() => {
    setImages([]);
    toast("All images cleared", { icon: "✨" });
  }, []);

  const handleConvert = useCallback(async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image.");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const blob = await convertImagesToPdf(images, setProgress);

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Show confetti and success toast
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      toast.success("PDF downloaded successfully!", {
        icon: "🎉",
        duration: 4000,
      });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        (typeof err.response?.data === "string" && err.response.data) ||
        "Conversion failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [images]);

  /* ── Render ─────────────────────────────────────────── */

  const features = [
    { icon: Shield, value: "Privacy First", label: "Files never stored" },
    { icon: Zap, value: "Lightning Fast", label: "Instant conversion" },
    { icon: Layers, value: "Batch Support", label: "Up to 20+ images" },
    { icon: Users, value: "Multi-User", label: "Fully isolated" },
  ];

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "16px",
            background: "#1e1e2e",
            color: "#fff",
            fontSize: "14px",
            padding: "12px 16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          },
        }}
      />

      <ConfettiBurst show={showConfetti} />

      {/* Hero section */}
      <section className="relative overflow-hidden">
        <BackgroundParticles />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-12 text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-violet-100/80 border border-violet-200/60 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
            </motion.div>
            <span className="text-xs font-semibold text-violet-700">
              Free • No sign-up • Unlimited conversions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight"
          >
            Convert Images to{" "}
            <motion.span
              className="relative inline-block bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% auto" }}
            >
              PDF
              {/* Decorative underline */}
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </motion.span>{" "}
            <br className="hidden sm:block" />
            Instantly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Upload your images, reorder with drag &amp; drop, and download a
            beautifully merged PDF — all in your browser.
          </motion.p>

          {/* Features row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            {features.map((feat, i) => (
              <AnimatedStat
                key={feat.value}
                icon={feat.icon}
                value={feat.value}
                label={feat.label}
                delay={0.45 + i * 0.1}
              />
            ))}
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-6 h-6 mx-auto text-violet-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main workspace */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {/* Compression progress overlay */}
        <AnimatePresence>
          {compressing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/60 shadow-md"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-violet-300 border-t-violet-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-violet-700">
                    Compressing images… {compressionProgress.done}/{compressionProgress.total}
                  </p>
                  <div className="mt-1.5 h-2 bg-violet-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${(compressionProgress.done / compressionProgress.total) * 100}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <UploadZone onFilesAdded={handleFilesAdded} />

        <ImagePreview
          images={images}
          onReorder={handleReorder}
          onRemove={handleRemove}
        />

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ConvertButton
                onConvert={handleConvert}
                onClear={handleClear}
                loading={loading}
                progress={progress}
                disabled={images.length === 0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* How it works section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-gray-400">Three simple steps</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Upload", desc: "Drag & drop or browse your images", icon: "📤" },
            { step: "02", title: "Arrange", desc: "Reorder pages by dragging", icon: "🔀" },
            { step: "03", title: "Download", desc: "Get your merged PDF instantly", icon: "📄" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl hover:border-violet-100 transition-all duration-300 text-center"
            >
              <motion.div
                className="text-3xl mb-3"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                Step {item.step}
              </span>
              <h3 className="mt-1 text-lg font-bold text-gray-800">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-xs text-gray-400 border-t border-gray-100 bg-white/50">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Built with ❤️ using React, Tailwind CSS &amp; FastAPI — Free &amp; Open Source
        </motion.p>
      </footer>
    </>
  );
}
