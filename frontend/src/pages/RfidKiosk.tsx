import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, LogOut, LogIn, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { api } from "../api/client";

type ScanResult = { result: string; message: string; alarm: boolean } | null;

export default function RfidKiosk() {
  const [gate, setGate] = useState<"exit" | "entry">("exit");
  const [tag, setTag] = useState("");
  const [last, setLast] = useState<ScanResult>(null);
  const [events, setEvents] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadEvents = () => api.get("/rfid/events").then((r) => setEvents(r.data));

  useEffect(() => {
    loadEvents();
    inputRef.current?.focus();
  }, []);

  const scan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) return;
    try {
      const { data } = await api.post("/rfid/scan", { tag: tag.trim(), gate });
      setLast(data);
      loadEvents();
    } catch (err: any) {
      setLast({ result: "unknown_tag", message: err?.response?.data?.message || "Teg topilmadi", alarm: false });
    }
    setTag("");
    inputRef.current?.focus();
  };

  const statusStyles: Record<string, string> = {
    allowed: "bg-forest text-parchment",
    returned: "bg-forest text-parchment",
    alarm: "bg-red-700 text-white",
    unknown_tag: "bg-ink/80 text-white",
    info: "bg-gold text-forest-dark",
  };

  const Icon = last?.result === "alarm" ? AlertTriangle : last?.result === "info" ? Info : CheckCircle2;

  return (
    <section className="max-w-3xl mx-auto px-5 py-14 relative">
      <AnimatePresence>
        {last?.alarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: 3 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-[70]"
          />
        )}
      </AnimatePresence>
      <h2 className="font-display font-semibold text-2xl md:text-3xl mb-1">RFID darvoza kioski</h2>
      <p className="text-ink/70 text-[15px] mb-8">
        Xodimlar uchun. Real RFID skaner shu maydonga avtomatik ravishda teg raqamini kiritadi.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setGate("exit")}
          className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded border ${
            gate === "exit" ? "bg-forest text-parchment border-forest" : "border-forest/30"
          }`}
        >
          <LogOut size={16} /> Chiqish darvozasi
        </button>
        <button
          onClick={() => setGate("entry")}
          className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded border ${
            gate === "entry" ? "bg-forest text-parchment border-forest" : "border-forest/30"
          }`}
        >
          <LogIn size={16} /> Kirish darvozasi (qaytarish)
        </button>
      </div>

      <form onSubmit={scan} className="flex items-center gap-2 bg-white border border-forest/25 rounded px-4 py-3 mb-6">
        <ScanLine size={18} className="text-ink/50" />
        <input
          ref={inputRef}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="RFID tegini skanerlang yoki qo'lda kiriting (mas: RFID-1000)"
          className="border-none outline-none bg-transparent text-sm w-full font-mono"
        />
        <button type="submit" className="text-sm font-bold bg-gold text-forest-dark rounded px-4 py-2">
          Skanerlash
        </button>
      </form>

      <AnimatePresence mode="wait">
        {last && (
          <motion.div
            key={last.message + Math.random()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center gap-3 rounded-lg px-5 py-4 mb-8 font-semibold ${
              statusStyles[last.result] || "bg-ink/80 text-white"
            }`}
          >
            <motion.div
              animate={last.alarm ? { scale: [1, 1.25, 1] } : {}}
              transition={{ repeat: last.alarm ? Infinity : 0, duration: 0.7 }}
            >
              <Icon size={22} />
            </motion.div>
            {last.message}
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="font-display font-semibold text-lg mb-3">So'nggi hodisalar</h3>
      <div className="border border-forest/15 rounded divide-y divide-forest/10">
        {events.length === 0 && <div className="px-4 py-4 text-sm text-ink/55">Hozircha hodisalar yo'q.</div>}
        {events.map((ev) => (
          <div key={ev.id} className="px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold">{ev.title || ev.tag}</span>{" "}
              <span className="text-ink/50">· {ev.gate === "exit" ? "chiqish" : "kirish"}</span>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                ev.result === "alarm" ? "bg-red-100 text-red-700" : "bg-forest/10 text-forest"
              }`}
            >
              {ev.result}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
