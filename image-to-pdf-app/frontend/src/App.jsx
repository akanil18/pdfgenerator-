import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50 font-sans"
    >
      <Navbar />
      <Home />
    </motion.div>
  );
}
