import { useState } from "react";
import { Unlock } from "lucide-react";
import ToolPage from "../components/ToolPage";
import { unlockPdf } from "../services/api";

export default function UnlockPdfPage() {
    const [password, setPassword] = useState("");

    return (
        <ToolPage
            title="Unlock PDF"
            description="Remove PDF password protection and security restrictions, giving you full access to the file."
            icon={Unlock}
            accentFrom="from-teal-500"
            accentTo="to-cyan-500"
            acceptMultiple={false}
            uploadLabel="Drag & drop a locked PDF file"
            outputFilename="unlocked.pdf"
            outputMime="application/pdf"
            onProcess={async (files, setProgress) => {
                return await unlockPdf(files[0], password, setProgress);
            }}
            extraControls={
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-md">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        PDF Password (if required)
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the PDF password (leave empty if owner-locked)"
                        className="w-full px-4 py-3 rounded-xl border-2 border-red-200 bg-red-50/20 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none focus:border-red-500 transition-colors"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                        Some PDFs only have owner restrictions (print/copy disabled) — those can be unlocked without a password.
                    </p>
                </div>
            }
            steps={[
                { icon: "📤", title: "Upload", desc: "Select a locked PDF file" },
                { icon: "🔑", title: "Enter password", desc: "Provide the password if needed" },
                { icon: "📥", title: "Download", desc: "Get your unlocked PDF" },
            ]}
            features={[
                { icon: "🔓", text: "Remove password protection from PDFs" },
                { icon: "🖨️", text: "Re-enable printing, copying, and editing" },
                { icon: "🔑", text: "Support for both user and owner passwords" },
                { icon: "⚡", text: "Instant processing — no waiting" },
                { icon: "🔒", text: "Your password is never stored or logged" },
                { icon: "🆓", text: "Completely free to use" },
            ]}
        />
    );
}
