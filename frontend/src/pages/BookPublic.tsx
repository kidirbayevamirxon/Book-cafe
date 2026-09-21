import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Volume2, Square, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Book } from "../types";

export default function BookPublic() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`).then((r) => setBook(r.data)).catch(() => setBook(null));
  }, [id]);

  const toggleAudio = () => {
    if (!book || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(`${book.title}. Muallif: ${book.author}. ${book.description}`);
    utter.lang = "ru-RU";
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  if (!book) {
    return <div className="max-w-lg mx-auto px-5 py-20 text-center text-ink/60">Yuklanmoqda…</div>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-5 py-16"
    >
      <span className="inline-block text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full mb-4">
        {book.category}
      </span>
      <h1 className="font-display font-semibold text-3xl mb-1">{book.title}</h1>
      <div className="text-ink/60 mb-6">{book.author}</div>
      <p className="text-[15px] leading-relaxed text-ink/80 mb-6">{book.description}</p>
      {book.has_audio ? (
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 text-sm font-bold text-forest border border-forest/40 rounded px-4 py-2.5 mb-6 hover:bg-forest hover:text-parchment transition-colors"
        >
          {speaking ? <Square size={15} /> : <Volume2 size={15} />}
          {speaking ? "To'xtatish" : "Audio holatda tinglash"}
        </button>
      ) : null}
      <div className="flex items-center gap-1.5 text-xs text-ink/60">
        <ShieldCheck size={14} /> RFID: {book.rfid_tag}
      </div>
    </motion.section>
  );
}
