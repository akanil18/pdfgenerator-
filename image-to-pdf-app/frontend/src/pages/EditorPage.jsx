import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
    RotateCcw,
    RotateCw,
    Trash2,
    Eye,
    GripVertical,
    Hash,
    Plus,
    FileDown,
    Loader2,
    Sparkles,
    ArrowLeft,
    CheckCircle,
    Image as ImageIcon,
} from "lucide-react";

import { useImages } from "../context/ImageContext";
import { convertImagesToPdf } from "../services/api";
import DownloadModal from "../components/DownloadModal";
import PreviewModal from "../components/PreviewModal";
import UploadZone from "../components/UploadZone";
import imageCompression from "browser-image-compression";

/* ────────────────────────────── helpers ───────────────────────────── */

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

/* ────────────────────────────── ImageCard ─────────────────────────── */

function ImageCard({ item, idx, url, snapshot, prov, onRemove, onRotateCw, onRotateCcw, onPreview }) {
    return (
        <div
            ref={prov.innerRef}
            {...prov.draggableProps}
            {...prov.dragHandleProps}
            style={{
                ...prov.draggableProps.style,
                // Prevent browser default drag ghost + remove any transition that causes blink
                transition: snapshot.isDragging
                    ? prov.draggableProps.style?.transition
                    : "transform 0.2s cubic-bezier(0.2,0,0,1)",
            }}
        >
            <div
                className={`
          group relative bg-white rounded-2xl overflow-hidden shadow-md border
          select-none cursor-grab active:cursor-grabbing
          ${snapshot.isDragging
                        ? "ring-2 ring-red-400 shadow-2xl shadow-red-200/60 border-red-300 z-50 scale-[1.04]"
                        : "border-gray-100 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/40"
                    }
        `}
                style={{
                    width: 170,
                    minWidth: 170,
                    transition: "box-shadow 0.2s, border-color 0.2s",
                }}
            >
                {/* ── Thumbnail ── */}
                <div className="relative h-44 overflow-hidden bg-gray-50">
                    <img
                        src={url}
                        alt={item.file.name}
                        draggable={false}
                        className="w-full h-full object-cover"
                        style={{
                            transform: `rotate(${item.rotation}deg)${item.rotation % 180 !== 0 ? " scale(0.72)" : ""}`,
                            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
                        }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                    {/* Page badge */}
                    <span className="absolute top-2 left-2 bg-black/55 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" />
                        {idx + 1}
                    </span>

                    {/* Drag handle icon */}
                    <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/70 backdrop-blur-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Rotation indicator */}
                    {item.rotation !== 0 && (
                        <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {item.rotation}°
                        </span>
                    )}

                    {/* File info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
                        <p className="text-[10px] text-white truncate font-medium">{item.file.name}</p>
                        <p className="text-[8px] text-white/60">{(item.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                </div>

                {/* ── Action bar ── */}
                <div className="flex items-center justify-around px-2 py-2.5 bg-gray-50 border-t border-gray-100">
                    {/* Rotate CCW */}
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85, rotate: -45 }}
                        onClick={(e) => { e.stopPropagation(); onRotateCcw(idx); }}
                        title="Rotate left"
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </motion.button>

                    {/* Preview */}
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); onPreview(idx); }}
                        title="Preview image"
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </motion.button>

                    {/* Rotate CW */}
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85, rotate: 45 }}
                        onClick={(e) => { e.stopPropagation(); onRotateCw(idx); }}
                        title="Rotate right"
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <RotateCw className="w-4 h-4" />
                    </motion.button>

                    {/* Delete */}
                    <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                        title="Remove image"
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────── Confetti ──────────────────────────── */

function ConfettiBurst({ show }) {
    if (!show) return null;
    const pieces = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 500,
        y: -(Math.random() * 350 + 80),
        rotate: Math.random() * 720 - 360,
        color: ["#ef4444", "#dc2626", "#f87171", "#fb7185", "#fca5a5", "#f472b6"][i % 6],
        size: Math.random() * 9 + 4,
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
                    transition={{ duration: 1.6, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

/* ────────────────────────────── EditorPage ───────────────────────── */

export default function EditorPage() {
    const navigate = useNavigate();
    const { images, removeImage, reorderImages, rotateImage, addImages, clearImages } = useImages();

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(null);
    const [addingMore, setAddingMore] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState({ done: 0, total: 0 });
    const [compressing, setCompressing] = useState(false);

    // ── Stable object URLs keyed by file reference
    const urls = useMemo(
        () => images.map((item) => URL.createObjectURL(item.file)),
        // We key off the identity list so URLs only regenerate when files actually change
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [images]
    );

    // ── Redirect to home if no images
    if (images.length === 0 && !compressing && !loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-red-100 to-rose-100 shadow-xl"
                >
                    <ImageIcon className="w-16 h-16 text-red-500 mx-auto" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <h2 className="text-2xl font-extrabold text-gray-800">No images yet</h2>
                    <p className="text-gray-400 mt-1 text-sm">Upload some images from the home page first.</p>
                </motion.div>
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 16px 40px rgba(220,38,38,0.25)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go to Upload
                </motion.button>
            </div>
        );
    }

    // ── DnD handler
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        reorderImages(result.source.index, result.destination.index);
    };

    // ── Open convert → show name modal
    const handleConvertClick = () => {
        if (images.length === 0) {
            toast.error("Please add at least one image.");
            return;
        }
        setShowDownloadModal(true);
    };

    // ── After user types filename and picks page size
    const handleDownloadConfirm = async (filename, pageSize) => {
        setShowDownloadModal(false);
        setLoading(true);
        setUploadProgress(0);

        try {
            const rotatedFiles = await Promise.all(
                images.map(({ file, rotation }) => applyRotation(file, rotation))
            );

            const blob = await convertImagesToPdf(rotatedFiles, setUploadProgress, pageSize);

            const finalName = `${filename}.pdf`;
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: finalName,
                        types: [{ description: "PDF File", accept: { "application/pdf": [".pdf"] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (err) {
                    if (err.name !== "AbortError") {
                        fallbackDownload(blob, finalName);
                    } else {
                        setLoading(false);
                        return;
                    }
                }
            } else {
                fallbackDownload(blob, finalName);
            }

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2200);
            toast.success(`"${finalName}" saved successfully! 🎉`, { duration: 3000 });

            // Redirect to home after a short delay so user sees the success animation
            setTimeout(() => {
                clearImages();
                navigate("/");
            }, 2500);
        } catch (err) {
            const message =
                err.response?.data?.detail ||
                (typeof err.response?.data === "string" && err.response.data) ||
                "Conversion failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    // ── Add more images
    const handleAddMore = useCallback(
        async (newFiles) => {
            setCompressing(true);
            setCompressionProgress({ done: 0, total: newFiles.length });
            const out = [];
            for (let i = 0; i < newFiles.length; i++) {
                const c = await compressImage(newFiles[i]);
                out.push(c);
                setCompressionProgress({ done: i + 1, total: newFiles.length });
            }
            addImages(out);
            setCompressing(false);
            setAddingMore(false);
            toast.success(`${out.length} more image${out.length > 1 ? "s" : ""} added!`, { icon: "📸" });
        },
        [addImages]
    );

    // ── Preview helpers
    const openPreview = (idx) => setPreviewIdx(idx);
    const closePreview = () => setPreviewIdx(null);
    const prevPreview = () => setPreviewIdx((i) => Math.max(0, i - 1));
    const nextPreview = () => setPreviewIdx((i) => Math.min(images.length - 1, i + 1));

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

            <DownloadModal
                open={showDownloadModal}
                onConfirm={handleDownloadConfirm}
                onClose={() => setShowDownloadModal(false)}
            />

            {previewIdx !== null && (
                <PreviewModal
                    open
                    src={urls[previewIdx] ?? ""}
                    name={images[previewIdx]?.file.name ?? ""}
                    rotation={images[previewIdx]?.rotation ?? 0}
                    onClose={closePreview}
                    onPrev={prevPreview}
                    onNext={nextPreview}
                    hasPrev={previewIdx > 0}
                    hasNext={previewIdx < images.length - 1}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
                {/* ── Header bar ── */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.07, x: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-300 hover:text-red-600 hover:shadow-md transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </motion.button>

                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Edit your PDF</h1>
                            <p className="text-sm text-gray-400 mt-0.5">
                                Rotate, preview and reorder your{" "}
                                <span className="font-semibold text-red-600">{images.length}</span>{" "}
                                image{images.length !== 1 && "s"} below
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Tip badge */}
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-full font-medium">
                            <GripVertical className="w-3 h-3" /> Drag cards to reorder pages
                        </span>

                        {/* Clear all */}
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => { clearImages(); navigate("/"); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear all
                        </motion.button>

                        {/* Add more */}
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setAddingMore((v) => !v)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-400 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add more
                        </motion.button>

                        {/* Convert → PDF */}
                        <motion.button
                            whileHover={!loading ? { scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.3)" } : {}}
                            whileTap={!loading ? { scale: 0.96 } : {}}
                            onClick={handleConvertClick}
                            disabled={loading || images.length === 0}
                            className={`
                relative overflow-hidden flex items-center gap-2.5 px-7 py-2.5 rounded-2xl font-bold text-white text-sm
                transition-all duration-500 shadow-lg
                ${loading || images.length === 0
                                    ? "bg-gray-300 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-red-500 via-red-600 to-rose-600"
                                }
              `}
                        >
                            {!loading && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                            {loading && (
                                <motion.div
                                    className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-2xl"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ ease: "easeOut", duration: 0.3 }}
                                />
                            )}
                            <span className="flex items-center gap-2 relative z-10">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Converting… {uploadProgress > 0 && `${uploadProgress}%`}
                                    </>
                                ) : (
                                    <>
                                        <FileDown className="w-4 h-4" />
                                        Convert to PDF
                                        <Sparkles className="w-3.5 h-3.5 opacity-70" />
                                    </>
                                )}
                            </span>
                        </motion.button>
                    </div>
                </div>

                {/* ── Add More zone (collapsible) ── */}
                <AnimatePresence>
                    {addingMore && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            {compressing ? (
                                <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 shadow-md">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-7 h-7 rounded-full border-2 border-red-300 border-t-red-600"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-700">
                                                Optimising… {compressionProgress.done}/{compressionProgress.total}
                                            </p>
                                            <div className="mt-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                                                    animate={{ width: `${(compressionProgress.done / compressionProgress.total) * 100}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <UploadZone onFilesAdded={handleAddMore} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Image grid ── */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="editor-grid" direction="horizontal">
                        {(provided, droppableSnap) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`
                  flex flex-wrap gap-5 p-5 rounded-3xl min-h-[260px] transition-colors duration-200
                  ${droppableSnap.isDraggingOver
                                        ? "bg-red-50/60 ring-2 ring-red-300 ring-dashed"
                                        : "bg-white/40 ring-1 ring-gray-100"
                                    }
                `}
                            >
                                {images.map((item, idx) => (
                                    <Draggable key={item.file.name + "-" + idx} draggableId={item.file.name + "-" + idx} index={idx}>
                                        {(prov, snapshot) => (
                                            <ImageCard
                                                item={item}
                                                idx={idx}
                                                url={urls[idx]}
                                                snapshot={snapshot}
                                                prov={prov}
                                                onRemove={removeImage}
                                                onRotateCw={(i) => rotateImage(i, "cw")}
                                                onRotateCcw={(i) => rotateImage(i, "ccw")}
                                                onPreview={openPreview}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* ── Bottom summary bar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex items-center justify-between flex-wrap gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-md"
                >
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>
                            <strong className="text-gray-800">{images.length}</strong> page
                            {images.length !== 1 && "s"} ready • Drag to reorder • Click{" "}
                            <Eye className="w-3.5 h-3.5 inline text-blue-500" /> to preview •{" "}
                            <RotateCw className="w-3.5 h-3.5 inline text-red-500" /> to rotate
                        </span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: "0 16px 40px rgba(220,38,38,0.25)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConvertClick}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-200 transition-all"
                    >
                        <FileDown className="w-4 h-4" />
                        Convert &amp; Save PDF
                    </motion.button>
                </motion.div>
            </div>
        </>
    );
}

/* ────────────────────────── fallback download helper ──────────────── */

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

/* ────────────────────────── canvas rotation helper ────────────────── */

async function applyRotation(file, rotation) {
    if (rotation === 0) return file;

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const rad = (rotation * Math.PI) / 180;
            const swap = rotation === 90 || rotation === 270;
            const w = swap ? img.height : img.width;
            const h = swap ? img.width : img.height;

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rad);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            URL.revokeObjectURL(url);

            canvas.toBlob(
                (blob) => {
                    const rotatedFile = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    resolve(rotatedFile);
                },
                "image/jpeg",
                0.92
            );
        };
        img.src = url;
    });
}
