import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Layers,
  Scissors,
  FileText,
  FileSpreadsheet,
  MonitorPlay,
  Minimize2,
  Unlock,
  PenTool,
  Star,
  Shield,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

/* ── Tool definitions ── */
const TOOLS = [
  {
    id: "image-to-pdf",
    title: "JPG to PDF",
    desc: "Convert JPG images to PDF, rotate them, reorder, and set page margins.",
    icon: ImageIcon,
    gradient: "from-red-500 to-rose-500",
    shadow: "shadow-red-200/60",
    bg: "bg-red-50",
    path: "/image-to-pdf",
  },
  {
    id: "merge-pdf",
    title: "Merge PDF",
    desc: "Select multiple PDF files and merge them into one document in seconds.",
    icon: Layers,
    gradient: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-200/60",
    bg: "bg-orange-50",
    path: "/merge-pdf",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    desc: "Split a PDF file by page ranges or extract all PDF pages individually.",
    icon: Scissors,
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-200/60",
    bg: "bg-rose-50",
    path: "/split-pdf",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    desc: "Convert PDF to editable Word documents for free. Preserves formatting.",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-200/60",
    bg: "bg-blue-50",
    path: "/pdf-to-word",
  },
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    desc: "Extract all your PDF tables to EXCEL spreadsheets automatically.",
    icon: FileSpreadsheet,
    gradient: "from-emerald-500 to-green-500",
    shadow: "shadow-emerald-200/60",
    bg: "bg-emerald-50",
    path: "/pdf-to-excel",
  },
  {
    id: "pdf-to-ppt",
    title: "PDF to PowerPoint",
    desc: "Turn your PDF into editable PowerPoint presentations instantly.",
    icon: MonitorPlay,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-200/60",
    bg: "bg-amber-50",
    path: "/pdf-to-ppt",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    desc: "Reduce PDF file size while maintaining quality. Choose compression level.",
    icon: Minimize2,
    gradient: "from-purple-500 to-violet-500",
    shadow: "shadow-purple-200/60",
    bg: "bg-purple-50",
    path: "/compress-pdf",
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    desc: "Remove PDF password security, giving you full access to the file.",
    icon: Unlock,
    gradient: "from-teal-500 to-cyan-500",
    shadow: "shadow-teal-200/60",
    bg: "bg-teal-50",
    path: "/unlock-pdf",
  },
  {
    id: "handwriting",
    title: "Handwriting to PDF",
    desc: "Convert handwritten notes to clean, typeset documents using AI-powered recognition.",
    icon: PenTool,
    gradient: "from-indigo-500 to-purple-500",
    shadow: "shadow-indigo-200/60",
    bg: "bg-indigo-50",
    path: "/handwriting",
  },
];

/* ── Background blobs ── */
function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-red-200/30 via-rose-200/20 to-transparent rounded-full blur-3xl"
        animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-bl from-orange-200/20 via-pink-200/15 to-transparent rounded-full blur-3xl"
        animate={{ x: [0, -50, 40, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-1/2 w-[400px] h-[400px] bg-gradient-to-t from-purple-200/20 to-transparent rounded-full blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Tool Card ── */
function ToolCard({ tool, index }) {
  const Icon = tool.icon;
  return (
    <Link to={tool.path}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative h-full p-6 rounded-2xl bg-white border border-gray-100
          shadow-md hover:shadow-2xl hover:${tool.shadow}
          transition-all duration-400 cursor-pointer overflow-hidden
        `}
      >
        {/* Hover gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl`} />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${tool.gradient} shadow-lg ${tool.shadow} mb-4`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
            {tool.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">{tool.desc}</p>

          {/* Arrow */}
          <motion.div
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}
          >
            Use tool <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Main Home Page ── */
export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <BackgroundBlobs />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200/60 backdrop-blur-sm"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Star className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            </motion.div>
            <span className="text-xs font-semibold text-red-700">
              Free • No sign-up • Unlimited usage
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
          >
            Every tool you need to{" "}
            <br className="hidden sm:block" />
            work with{" "}
            <motion.span
              className="relative inline-block bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% auto" }}
            >
              PDFs
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-rose-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
            All tools are free and easy to use.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            {[
              { icon: Shield, text: "Privacy First" },
              { icon: Zap, text: "Lightning Fast" },
              { icon: Users, text: "Multi-User Safe" },
            ].map((b) => (
              <motion.div
                key={b.text}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm"
              >
                <b.icon className="w-4 h-4 text-red-500" />
                <span className="font-medium text-gray-600">{b.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">All PDF Tools</h2>
          <p className="mt-2 text-sm text-gray-400">Click any tool to get started</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-xs text-gray-400 border-t border-gray-100 bg-white/50">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Built with ❤️ using React, Tailwind CSS &amp; FastAPI — Free &amp; Open Source
        </motion.p>
      </footer>
    </>
  );
}
