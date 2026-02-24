import { FileText } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { pdfToWord } from "../services/api";

export default function PdfToWordPage() {
    return (
        <ToolPage
            title="PDF to Word"
            description="Convert PDF to editable Word documents for free. Preserves formatting, tables, and images."
            icon={FileText}
            accentFrom="from-blue-500"
            accentTo="to-indigo-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a PDF to convert to Word"
            outputFilename="converted.docx"
            outputMime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onProcess={async (files, setProgress) => {
                return await pdfToWord(files[0], setProgress);
            }}
            steps={[
                { icon: "📤", title: "Upload PDF", desc: "Select your PDF file" },
                { icon: "🔄", title: "Convert", desc: "Our engine converts to Word format" },
                { icon: "📥", title: "Download", desc: "Get your editable DOCX file" },
            ]}
            features={[
                { icon: "📝", text: "Fully editable Word document output" },
                { icon: "📊", text: "Preserves tables, images, and formatting" },
                { icon: "🎨", text: "Maintains original layout as closely as possible" },
                { icon: "⚡", text: "Fast conversion powered by our backend engine" },
                { icon: "🔒", text: "Secure — files are never stored permanently" },
                { icon: "🆓", text: "No signup, no limits, 100% free" },
            ]}
        />
    );
}
