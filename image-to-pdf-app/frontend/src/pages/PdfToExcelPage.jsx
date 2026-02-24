import { FileSpreadsheet } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { pdfToExcel } from "../services/api";

export default function PdfToExcelPage() {
    return (
        <ToolPage
            title="PDF to Excel"
            description="Extract all your PDF tables to EXCEL spreadsheets automatically. Clean, formatted data ready to use."
            icon={FileSpreadsheet}
            accentFrom="from-emerald-500"
            accentTo="to-green-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a PDF with tables"
            outputFilename="extracted.xlsx"
            outputMime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onProcess={async (files, setProgress) => {
                return await pdfToExcel(files[0], setProgress);
            }}
            steps={[
                { icon: "📤", title: "Upload PDF", desc: "Select a PDF with tabular data" },
                { icon: "🔍", title: "Extract", desc: "Our engine detects and extracts tables" },
                { icon: "📥", title: "Download", desc: "Get your Excel spreadsheet" },
            ]}
            features={[
                { icon: "📊", text: "Automatically detects tables in your PDF" },
                { icon: "📑", text: "Each page's tables become separate sheets" },
                { icon: "✨", text: "Clean, properly formatted Excel output" },
                { icon: "⚡", text: "Works with complex multi-column layouts" },
                { icon: "🔒", text: "Your data remains private and secure" },
                { icon: "🆓", text: "Unlimited conversions — completely free" },
            ]}
        />
    );
}
