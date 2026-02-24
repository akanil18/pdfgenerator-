import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, AlertCircle, UploadCloud } from "lucide-react";

const ACCEPTED_TYPES = { "application/pdf": [".pdf"] };
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export default function PdfUploadZone({ onFilesAdded, multiple = true, label }) {
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
        multiple,
    });

    return (
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
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center gap-5 py-16 px-6">
                <AnimatePresence mode="wait">
                    {isDragReject ? (
                        <motion.div
                            key="reject"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="p-5 rounded-2xl bg-red-100 shadow-lg"
                        >
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </motion.div>
                    ) : isDragActive ? (
                        <motion.div
                            key="active"
                            initial={{ scale: 0, y: 30 }}
                            animate={{ scale: 1.15, y: 0 }}
                            exit={{ scale: 0, y: -30 }}
                            className="p-5 rounded-2xl bg-red-100 shadow-lg"
                        >
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                                <FileUp className="w-12 h-12 text-red-600" />
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
                            <motion.div
                                className="absolute inset-0 rounded-2xl border-2 border-red-300/50"
                                animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">
                        {isDragReject
                            ? "Only PDF files are accepted!"
                            : isDragActive
                                ? "Drop your PDF here…"
                                : label || "Drag & drop PDF files here"}
                    </p>
                    <p className="mt-1.5 text-sm text-gray-400">
                        or{" "}
                        <span className="text-red-600 font-medium underline underline-offset-2 cursor-pointer">
                            browse files
                        </span>
                    </p>
                    <p className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-full px-4 py-1.5 inline-block">
                        PDF files only — Max 50 MB each
                    </p>
                </div>
            </div>
        </div>
    );
}
