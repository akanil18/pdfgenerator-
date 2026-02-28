import { PenTool } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { handwritingToPdf } from "../services/api";

export default function HandwritingPage() {
  return (
    <ToolPage
      title="Handwriting to PDF"
      description="Convert handwritten notes to clean, typeset PDF documents using AI. Upload a scanned PDF of your notes and get beautifully formatted output."
      icon={PenTool}
      accentFrom="from-indigo-500"
      accentTo="to-purple-500"
      acceptMultiple={false}
      uploadLabel="Drag & drop a PDF of handwritten notes"
      outputFilename="typeset_notes.pdf"
      outputMime="application/pdf"
      onProcess={async (files, setProgress) => {
        return await handwritingToPdf(files[0], setProgress);
      }}
      steps={[
        { icon: "1", title: "Upload PDF", desc: "Upload a scanned PDF of your handwritten notes" },
        { icon: "2", title: "AI Extraction", desc: "GPT-4o Vision reads and extracts your handwriting" },
        { icon: "3", title: "LaTeX Typeset", desc: "Content is compiled into a clean, typeset PDF" },
      ]}
      features={[
        { icon: "A", text: "Recognizes handwritten text and math equations" },
        { icon: "B", text: "Converts mathematical formulas to proper LaTeX notation" },
        { icon: "C", text: "Powered by GPT-4o Vision AI for accurate extraction" },
        { icon: "D", text: "Produces clean, professional typeset PDF output" },
        { icon: "E", text: "Your notes are processed securely and never stored" },
        { icon: "F", text: "Supports multi-page documents" },
      ]}
    />
  );
}
