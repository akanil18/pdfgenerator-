import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
    ArrowLeft,
    Download,
    Loader2,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import PdfUploadZone from "./PdfUploadZone";

/**
 * Reusable full-page layout for every PDF tool.
 *
 * Props:
 *   title        – e.g. "Merge PDF"
 *   description  – a short sentence
 *   icon         – Lucide icon component
 *   accentFrom   – tailwind gradient start, e.g. "from-red-500"
 *   accentTo     – tailwind gradient end,   e.g. "to-rose-500"
 *   steps        – array of { icon, title, desc }
 *   features     – array of { icon, text }
 *   acceptMultiple – boolean (default true)
 *   uploadLabel  – override "Drag & drop …" label
 *   extraControls – React node rendered below upload zone (e.g. range input, password input)
 *   onProcess    – async (files, setProgress) => Blob   — the actual API call
 *   outputFilename – string e.g. "merged.pdf"
 *   outputMime   – MIME type for file save picker
 */
export default function ToolPage({
    title,
    description,
    icon: Icon,
    accentFrom = "from-red-500",
    accentTo = "to-rose-600",
    steps = [],
    features = [],
    acceptMultiple = true,
    uploadLabel,
    extraControls,
    onProcess,
    outputFilename = "output.pdf",
    outputMime = "application/pdf",
}) {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    const handleFiles = (newFiles) => {
        setFiles((prev) => [...prev, ...newFiles]);
        toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} added`);
    };

    const removeFile = (idx) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            toast.error("Please upload at least one file.");
            return;
        }
        setLoading(true);
        setProgress(0);

        try {
            const blob = await onProcess(files, setProgress);

            // Try native file picker first
            if (window.showSaveFilePicker) {
                try {
                    const ext = outputFilename.split(".").pop();
                    const handle = await window.showSaveFilePicker({
                        suggestedName: outputFilename,
                        types: [{ description: title, accept: { [outputMime]: [`.${ext}`] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (err) {
                    if (err.name === "AbortError") {
                        setLoading(false);
                        return;
                    }
                    fallbackDownload(blob, outputFilename);
                }
            } else {
                fallbackDownload(blob, outputFilename);
            }

            setDone(true);
            toast.success(`${title} completed! 🎉`, { duration: 3000 });
            setTimeout(() => {
                setDone(false);
                setFiles([]);
                navigate("/");
            }, 2500);
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                (typeof err.response?.data === "string" && err.response.data) ||
                "Processing failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* ── Back button ── */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-300 hover:text-red-600 hover:shadow-md transition-all mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Tools
                </motion.button>

                {/* ── Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className={`inline-flex p-4 rounded-3xl bg-gradient-to-br ${accentFrom} ${accentTo} shadow-xl mb-5`}
                    >
                        <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                    <p className="mt-3 text-gray-500 max-w-lg mx-auto leading-relaxed">{description}</p>
                </motion.div>

                {/* ── Upload zone ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <PdfUploadZone
                        onFilesAdded={handleFiles}
                        multiple={acceptMultiple}
                        label={uploadLabel}
                    />
                </motion.div>

                {/* ── File list ── */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 space-y-2"
                        >
                            {files.map((f, idx) => (
                                <motion.div
                                    key={f.name + idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo}`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                                            <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeFile(idx)}
                                        className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors px-2"
                                    >
                                        ✕
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Extra controls (e.g. page range input, quality selector) ── */}
                {files.length > 0 && extraControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                    >
                        {extraControls}
                    </motion.div>
                )}

                {/* ── Process button ── */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 flex justify-center"
                        >
                            <motion.button
                                whileHover={!loading ? { scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.3)" } : {}}
                                whileTap={!loading ? { scale: 0.96 } : {}}
                                onClick={handleProcess}
                                disabled={loading || done}
                                className={`
                  relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-base
                  transition-all duration-500 shadow-lg
                  ${loading || done
                                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                                        : `bg-gradient-to-r ${accentFrom} ${accentTo}`
                                    }
                `}
                            >
                                {/* Shimmer */}
                                {!loading && !done && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                                {/* Progress fill */}
                                {loading && (
                                    <motion.div
                                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-2xl"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "easeOut", duration: 0.3 }}
                                    />
                                )}
                                <span className="flex items-center gap-2 relative z-10">
                                    {done ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Done!
                                        </>
                                    ) : loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing… {progress > 0 && `${progress}%`}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            {title}
                                            <Sparkles className="w-4 h-4 opacity-70" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── How it works ── */}
                {steps.length > 0 && (
                    <div className="mt-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-10"
                        >
                            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
                            <p className="mt-1 text-sm text-gray-400">Simple & straightforward</p>
                        </motion.div>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {steps.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl hover:border-red-100 transition-all text-center"
                                >
                                    <motion.div
                                        className="text-3xl mb-3"
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                    >
                                        {s.icon}
                                    </motion.div>
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                        Step {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="mt-1 text-base font-bold text-gray-800">{s.title}</h3>
                                    <p className="mt-1 text-xs text-gray-400">{s.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Features list ── */}
                {features.length > 0 && (
                    <div className="mt-16">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900">Features</h2>
                        </motion.div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all"
                                >
                                    <span className="text-xl">{f.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{f.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function fallbackDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
