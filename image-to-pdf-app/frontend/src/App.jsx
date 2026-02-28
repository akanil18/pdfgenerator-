import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ImageProvider } from "./context/ImageContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ImageToPdfPage from "./pages/ImageToPdfPage";
import EditorPage from "./pages/EditorPage";
import MergePdfPage from "./pages/MergePdfPage";
import SplitPdfPage from "./pages/SplitPdfPage";
import PdfToWordPage from "./pages/PdfToWordPage";
import PdfToExcelPage from "./pages/PdfToExcelPage";
import PdfToPptPage from "./pages/PdfToPptPage";
import CompressPdfPage from "./pages/CompressPdfPage";
import UnlockPdfPage from "./pages/UnlockPdfPage";
import HandwritingPage from "./pages/HandwritingPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <ImageProvider>
        <div className="min-h-screen bg-gray-50 font-sans">
          <Navbar />
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Home />} />

            {/* Image → PDF (upload + editor) */}
            <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
            <Route path="/editor" element={<EditorPage />} />

            {/* PDF tools */}
            <Route path="/merge-pdf" element={<MergePdfPage />} />
            <Route path="/split-pdf" element={<SplitPdfPage />} />
            <Route path="/pdf-to-word" element={<PdfToWordPage />} />
            <Route path="/pdf-to-excel" element={<PdfToExcelPage />} />
            <Route path="/pdf-to-ppt" element={<PdfToPptPage />} />
            <Route path="/compress-pdf" element={<CompressPdfPage />} />
            <Route path="/unlock-pdf" element={<UnlockPdfPage />} />
            <Route path="/handwriting" element={<HandwritingPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
      </ImageProvider>
    </BrowserRouter>
  );
}
