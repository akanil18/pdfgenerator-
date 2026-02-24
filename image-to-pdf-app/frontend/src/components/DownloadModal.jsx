import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, X, Sparkles, ChevronDown } from "lucide-react";

const PAGE_SIZE_OPTIONS = [
    { value: "fit", label: "Fit (Same page size as image)" },
    { value: "a4", label: "A4 (297×210 mm)" },
    { value: "letter", label: "US Letter (215×279.4 mm)" },
];

/**
 * Modal that asks the user for a PDF filename and page size before downloading.
 * Props:
 *   open        – boolean
 *   onConfirm   – (filename: string, pageSize: string) => void
 *   onClose     – () => void
 */
export default function DownloadModal({ open, onConfirm, onClose }) {
    const [name, setName] = useState("my-document");
    const [pageSize, setPageSize] = useState("fit");
    const [dropOpen, setDropOpen] = useState(false);
    const inputRef = useRef(null);

    // Focus the input when the modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const clean = (name.trim() || "my-document").replace(/\.pdf$/i, "");
        onConfirm(clean, pageSize);
    };

    const selectedLabel = PAGE_SIZE_OPTIONS.find((o) => o.value === pageSize)?.label;

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
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 30 }}
                        transition={{ type: "spring", stiffness: 340, damping: 26 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
                    >
                        <div className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                            {/* Header */}
                            <div className="relative px-8 pt-8 pb-5">
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100">
                                        <FileText className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-gray-900">Save your PDF</h2>
                                </div>
                                <p className="text-sm text-gray-400 mt-1 ml-[52px]">
                                    Choose a name and page size for your PDF file.
                                </p>

                                {/* Close */}
                                <motion.button
                                    whileHover={{ scale: 1.15, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 mx-6" />

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                                {/* Filename */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        PDF Filename
                                    </label>
                                    <div className="flex items-center gap-0 rounded-xl border-2 border-red-200 focus-within:border-red-500 bg-red-50/30 transition-all duration-200 overflow-hidden shadow-sm">
                                        <input
                                            ref={inputRef}
                                            id="pdf-name-input"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="my-document"
                                            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none"
                                        />
                                        <span className="px-4 py-3 text-sm font-semibold text-red-400 bg-red-50 border-l border-red-200 select-none">
                                            .pdf
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-400">
                                        The .pdf extension will be added automatically.
                                    </p>
                                </div>

                                {/* Page Size dropdown */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Page size
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setDropOpen((v) => !v)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-red-200 bg-red-50/30 text-sm font-medium text-gray-800 hover:border-red-400 transition-all duration-200 shadow-sm"
                                        >
                                            <span>{selectedLabel}</span>
                                            <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown className="w-4 h-4 text-red-400" />
                                            </motion.span>
                                        </button>

                                        <AnimatePresence>
                                            {dropOpen && (
                                                <motion.ul
                                                    initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                    exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute left-0 right-0 mt-1 bg-white border-2 border-red-200 rounded-xl shadow-xl z-10 overflow-hidden origin-top"
                                                >
                                                    {PAGE_SIZE_OPTIONS.map((opt) => (
                                                        <li
                                                            key={opt.value}
                                                            onClick={() => {
                                                                setPageSize(opt.value);
                                                                setDropOpen(false);
                                                            }}
                                                            className={`
                                px-4 py-3 text-sm font-medium cursor-pointer transition-colors
                                ${pageSize === opt.value
                                                                    ? "bg-red-500 text-white"
                                                                    : "text-gray-700 hover:bg-red-50"
                                                                }
                              `}
                                                        >
                                                            {opt.label}
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <motion.button
                                        type="button"
                                        onClick={onClose}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03, boxShadow: "0 12px 30px rgba(220,38,38,0.3)" }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all duration-200"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                        <Sparkles className="w-3.5 h-3.5 opacity-70" />
                                    </motion.button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
