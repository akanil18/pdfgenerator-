import { useState } from "react";
import { Scissors } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { splitPdf } from "../services/api";

export default function SplitPdfPage() {
    const [ranges, setRanges] = useState("");

    return (
        <ToolPage
            title="Split PDF"
            description="Split a PDF file by page ranges or extract individual pages. Get exactly the pages you need."
            icon={Scissors}
            accentFrom="from-rose-500"
            accentTo="to-pink-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a PDF file to split"
            outputFilename="split_pages.zip"
            outputMime="application/zip"
            onProcess={async (files, setProgress) => {
                return await splitPdf(files[0], ranges || null, setProgress);
            }}
            extraControls={
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Page ranges (optional)
                    </label>
                    <input
                        type="text"
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        placeholder="e.g., 1-3, 5, 7-9  (leave empty to extract all pages)"
                        className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-red-50/20 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none focus:border-red-500 transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                        Enter comma-separated page ranges. Leave empty to split every page into its own file.
                    </p>
                </div>
            }
            steps={[
                { icon: "📤", title: "Upload", desc: "Select a PDF file to split" },
                { icon: "✂️", title: "Choose pages", desc: "Enter page ranges or extract all" },
                { icon: "📥", title: "Download", desc: "Get your split pages as a ZIP" },
            ]}
            features={[
                { icon: "📑", text: "Extract specific pages by range (e.g., 1-3, 5, 7-9)" },
                { icon: "📄", text: "Split every page into separate PDF files" },
                { icon: "📦", text: "Multiple files are bundled into a ZIP download" },
                { icon: "⚡", text: "Fast processing on our secure servers" },
                { icon: "🔒", text: "Files are deleted immediately after processing" },
                { icon: "🆓", text: "Completely free — no limits" },
            ]}
        />
    );
}
