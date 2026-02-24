import { MonitorPlay } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { pdfToPpt } from "../services/api";

export default function PdfToPptPage() {
    return (
        <ToolPage
            title="PDF to PowerPoint"
            description="Turn your PDF into an editable PowerPoint presentation. Each page becomes a slide."
            icon={MonitorPlay}
            accentFrom="from-amber-500"
            accentTo="to-orange-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a PDF to convert to PPTX"
            outputFilename="converted.pptx"
            outputMime="application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onProcess={async (files, setProgress) => {
                return await pdfToPpt(files[0], setProgress);
            }}
            steps={[
                { icon: "📤", title: "Upload PDF", desc: "Select your PDF file" },
                { icon: "🖼️", title: "Convert", desc: "Each page becomes a slide" },
                { icon: "📥", title: "Download", desc: "Get your PowerPoint file" },
            ]}
            features={[
                { icon: "🖼️", text: "Each PDF page becomes a high-quality slide" },
                { icon: "📐", text: "Maintains original page dimensions" },
                { icon: "🎨", text: "High-resolution image rendering (200 DPI)" },
                { icon: "⚡", text: "Fast multi-page conversion" },
                { icon: "🔒", text: "Files processed securely and deleted after" },
                { icon: "🆓", text: "Free to use — no watermarks" },
            ]}
        />
    );
}
