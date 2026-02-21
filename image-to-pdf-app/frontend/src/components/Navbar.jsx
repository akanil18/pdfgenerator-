import { motion } from "framer-motion";
import { FileImage, Sparkles, Github } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100/80 shadow-sm"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200/60"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FileImage className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Img2PDF
          </span>
        </motion.div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -1 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 text-xs font-medium text-violet-700"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
            Free &amp; Unlimited
          </motion.div>

          {/* GitHub link placeholder */}
          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            <Github className="w-4 h-4" />
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}
