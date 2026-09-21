import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Toast({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="fixed bottom-6 left-1/2 bg-forest-dark text-parchment px-5 py-3 rounded text-sm font-semibold z-[80] flex items-center gap-2 shadow-xl"
        >
          <Check size={15} /> {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
