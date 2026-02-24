import { Layers } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { mergePdfs } from "../services/api";

export default function MergePdfPage() {
    return (
        <ToolPage
            title="Merge PDF"
            description="Select multiple PDF files and merge them into a single document in seconds. Maintain the order you want."
            icon={Layers}
            accentFrom="from-red-500"
            accentTo="to-orange-500"
            acceptMultiple={true}
            uploadLabel="Drag & drop multiple PDF files here"
            outputFilename="merged.pdf"
            outputMime="application/pdf"
            onProcess={async (files, setProgress) => {
                return await mergePdfs(files, setProgress);
            }}
            steps={[
                { icon: "📤", title: "Upload", desc: "Select two or more PDF files" },
                { icon: "🔀", title: "Arrange", desc: "Files are merged in upload order" },
                { icon: "📥", title: "Download", desc: "Get your merged PDF instantly" },
            ]}
            features={[
                { icon: "📄", text: "Merge unlimited PDF files at once" },
                { icon: "⚡", text: "Lightning fast — processed on our server" },
                { icon: "🔒", text: "Your files are deleted immediately after processing" },
                { icon: "🎯", text: "Preserves original quality and formatting" },
                { icon: "📱", text: "Works on any device — desktop, tablet, mobile" },
                { icon: "🆓", text: "100% free — no signup required" },
            ]}
        />
    );
}
