import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import {
    Image as ImageIcon,
    ArrowLeft,
    Shield,
    Zap,
    RotateCcw,
    Eye,
    Star,
} from "lucide-react";

import UploadZone from "../components/UploadZone";
import { useImages } from "../context/ImageContext";

const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
};

async function compressImage(file) {
    if (file.size <= 1 * 1024 * 1024 || file.type === "image/gif") return file;
    try {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
        const baseName = file.name.replace(/\.[^.]+$/, "");
        return new File([compressed], `${baseName}.jpg`, {
            type: compressed.type,
            lastModified: Date.now(),
        });
    } catch {
        return file;
    }
}

/**
 * Landing page for the Image → PDF tool.
 * Uploads images, compresses them, and navigates to the editor.
 */
export default function ImageToPdfPage() {
    const navigate = useNavigate();
    const { addImages } = useImages();
    const [compressing, setCompressing] = useState(false);
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    const handleFilesAdded = useCallback(
        async (newFiles) => {
            setCompressing(true);
            setProgress({ done: 0, total: newFiles.length });
            const out = [];
            for (let i = 0; i < newFiles.length; i++) {
                const c = await compressImage(newFiles[i]);
                out.push(c);
                setProgress({ done: i + 1, total: newFiles.length });
            }
            addImages(out);
            setCompressing(false);
            toast.success(`${out.length} image${out.length > 1 ? "s" : ""} ready — opening editor…`, {
                icon: "📸",
                duration: 2000,
            });
            setTimeout(() => navigate("/editor"), 600);
        },
        [addImages, navigate]
    );

    const features = [
        { icon: Shield, value: "Privacy First", label: "Files never stored" },
        { icon: Zap, value: "Lightning Fast", label: "Instant conversion" },
        { icon: RotateCcw, value: "Rotate & Reorder", label: "Full editor control" },
        { icon: Eye, value: "Preview Images", label: "Zoom before convert" },
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
                    },
                }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24">
                {/* Back */}
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

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-red-500 to-rose-500 shadow-xl mb-5"
                    >
                        <ImageIcon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        JPG to PDF
                    </h1>
                    <p className="mt-3 text-gray-500 max-w-lg mx-auto leading-relaxed">
                        Upload your images — rotate, reorder and preview them in our full editor,
                        then download a beautifully merged PDF with your own filename.
                    </p>
                </motion.div>

                {/* Stat cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-10"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            whileHover={{ y: -3 }}
                            className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-md border border-gray-100/80 hover:shadow-lg hover:border-red-100 transition-all"
                        >
                            <div className="p-2 rounded-xl bg-gradient-to-br from-red-100 to-rose-100">
                                <f.icon className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-800">{f.value}</p>
                                <p className="text-xs text-gray-400">{f.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Compression progress */}
                <AnimatePresence>
                    {compressing && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 shadow-md"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 rounded-full border-2 border-red-300 border-t-red-600"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-700">
                                        Optimising images… {progress.done}/{progress.total}
                                    </p>
                                    <div className="mt-1.5 h-2 bg-red-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload */}
                <UploadZone onFilesAdded={handleFilesAdded} />

                {/* How it works */}
                <div className="mt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
                        <p className="mt-2 text-sm text-gray-400">Four simple steps</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-4 gap-5">
                        {[
                            { step: "01", title: "Upload", desc: "Drag & drop or browse images", icon: "📤" },
                            { step: "02", title: "Edit", desc: "Rotate, reorder & preview pages", icon: "✏️" },
                            { step: "03", title: "Name", desc: "Give your PDF a custom filename", icon: "📝" },
                            { step: "04", title: "Save", desc: "Choose where to save your PDF", icon: "📄" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
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
                                    {item.icon}
                                </motion.div>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                    Step {item.step}
                                </span>
                                <h3 className="mt-1 text-base font-bold text-gray-800">{item.title}</h3>
                                <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
