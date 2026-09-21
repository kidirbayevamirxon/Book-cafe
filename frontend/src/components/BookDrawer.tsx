import { useState } from "react";
import { X, ShieldCheck, QrCode, Wifi, Volume2, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Book } from "../types";

export default function BookDrawer({
  book,
  color,
  reserved,
  onClose,
  onReserve,
}: {
  book: Book;
  color: string;
  reserved: boolean;
  onClose: () => void;
  onReserve: () => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const publicUrl = `${window.location.origin}/kitob/${book.id}`;

  const toggleAudio = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(`${book.title}. Muallif: ${book.author}. ${book.description}`);
    utter.lang = "ru-RU"; // ko'p brauzerlarda o'zbekcha ovoz mavjud emas, eng yaqin talaffuz
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-forest-dark/45 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-parchment z-[61] p-6 overflow-y-auto shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <button onClick={onClose} className="mb-4 p-1.5" aria-label="Yopish">
          <X size={20} />
        </button>

        <div className="flex gap-4 mb-5">
          <div
            className="w-[74px] h-[108px] rounded shrink-0"
            style={{ background: color, boxShadow: "inset -4px 0 8px rgba(0,0,0,0.2)" }}
          />
          <div className="bg-white p-2 rounded border border-forest/15 self-start">
            <QRCodeSVG value={publicUrl} size={90} fgColor="#0F3D2E" bgColor="#ffffff" />
            <div className="text-[10px] text-ink/50 text-center mt-1 flex items-center justify-center gap-1">
              <QrCode size={10} /> Skanerlang
            </div>
          </div>
        </div>

        <h2 className="font-display font-semibold text-2xl mb-1">{book.title}</h2>
        <div className="text-ink/60 text-sm mb-2">{book.author}</div>
        <span className="inline-block text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full mb-4">
          {book.category}
        </span>
        <p className="text-[14.5px] leading-relaxed text-ink/80 mb-4">{book.description}</p>

        {book.has_audio ? (
          <button
            onClick={toggleAudio}
            className="flex items-center gap-2 text-sm font-bold text-forest border border-forest/40 rounded px-4 py-2.5 mb-6 hover:bg-forest hover:text-parchment transition-colors"
          >
            {speaking ? <Square size={15} /> : <Volume2 size={15} />}
            {speaking ? "To'xtatish" : "Audio holatda tinglash"}
          </button>
        ) : null}

        <div className="flex gap-4 mb-6 flex-wrap text-[12.5px] text-ink/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={15} /> RFID: {book.rfid_tag}
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi size={15} /> IT-hududda mavjud
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onReserve}
          disabled={reserved || !book.available}
          className="w-full justify-center flex items-center gap-2 bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          {reserved ? "Band qilingan" : book.available ? "Band qilish" : "Hozircha mavjud emas"}
        </motion.button>
      </motion.div>
    </>
  );
}
