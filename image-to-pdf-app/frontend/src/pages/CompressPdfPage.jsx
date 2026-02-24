import { useState } from "react";
import { Minimize2 } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { compressPdf } from "../services/api";

const QUALITY_OPTIONS = [
    { value: "low", label: "Maximum Compression", desc: "Smallest file size, lower quality" },
    { value: "medium", label: "Balanced", desc: "Good compression with decent quality" },
    { value: "high", label: "Least Compression", desc: "Best quality, minimal size reduction" },
];

export default function CompressPdfPage() {
    const [quality, setQuality] = useState("medium");

    return (
        <ToolPage
            title="Compress PDF"
            description="Reduce your PDF file size while keeping the quality. Choose your compression level."
            icon={Minimize2}
            accentFrom="from-purple-500"
            accentTo="to-violet-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a PDF to compress"
            outputFilename="compressed.pdf"
            outputMime="application/pdf"
            onProcess={async (files, setProgress) => {
                return await compressPdf(files[0], quality, setProgress);
            }}
            extraControls={
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Compression Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {QUALITY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setQuality(opt.value)}
                                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${quality === opt.value
                                        ? "border-red-400 bg-red-50 shadow-md"
                                        : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/30"
                                    }
                `}
                            >
                                <p className={`text-sm font-bold ${quality === opt.value ? "text-red-600" : "text-gray-700"}`}>
                                    {opt.label}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            }
            steps={[
                { icon: "📤", title: "Upload", desc: "Select a PDF to compress" },
                { icon: "📊", title: "Choose level", desc: "Pick your compression level" },
                { icon: "📥", title: "Download", desc: "Get your smaller PDF file" },
            ]}
            features={[
                { icon: "📉", text: "Reduce PDF file size by up to 80%" },
                { icon: "🎚️", text: "Three compression levels to choose from" },
                { icon: "📄", text: "Maintains document readability" },
                { icon: "🖼️", text: "Smart image recompression for maximum savings" },
                { icon: "🔒", text: "Files processed securely — never stored" },
                { icon: "🆓", text: "No limits, no signup, completely free" },
            ]}
        />
    );
}
