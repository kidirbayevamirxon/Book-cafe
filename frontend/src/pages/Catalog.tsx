import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { Book, Reservation } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BookDrawer from "../components/BookDrawer";
import { useNavigate } from "react-router-dom";

const SPINE_COLORS = ["#5C4630", "#0F3D2E", "#7A2E2E", "#8A6E2F", "#2E4A6B", "#4B3B57", "#6B4226", "#3B5B45", "#6E3B2E", "#38506B"];

export default function Catalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("Barchasi");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Book | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/books/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    const params: any = {};
    if (category !== "Barchasi") params.category = category;
    if (query) params.q = query;
    api.get("/books", { params }).then((r) => setBooks(r.data));
  }, [category, query]);

  useEffect(() => {
    if (user) api.get("/reservations/me").then((r) => setReservations(r.data));
  }, [user]);

  const spineColor = (id: number) => SPINE_COLORS[id % SPINE_COLORS.length];
  const isReserved = (id: number) => reservations.some((r) => r.book_id === id && r.status === "active");

  const handleReserve = async () => {
    if (!selected) return;
    if (!user) {
      showToast("Iltimos, avval hisobga kiring");
      navigate("/hisobim");
      return;
    }
    try {
      await api.post("/reservations", { bookId: selected.id });
      showToast(`"${selected.title}" band qilindi`);
      const r = await api.get("/reservations/me");
      setReservations(r.data);
      const b = await api.get("/books");
      setBooks(b.data.filter((bk: Book) => (category === "Barchasi" ? true : bk.category === category)));
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-5 py-14">
      <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2">Kitoblar katalogi</h2>
      <p className="text-ink/70 text-[15px] mb-7">Javonlardan kitob tanlang — bosganingizda tafsilotlar yon paneldan ochiladi.</p>

      <div className="flex gap-3 flex-wrap items-center mb-4">
        <div className="flex items-center gap-2 bg-white border border-forest/25 rounded px-3 py-2.5 flex-1 min-w-[200px]">
          <Search size={16} className="text-ink/50" />
          <input
            placeholder="Nomi yoki muallif bo'yicha qidirish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        <button
          onClick={() => setCategory("Barchasi")}
          className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border ${
            category === "Barchasi" ? "bg-forest text-parchment border-forest" : "border-forest/30"
          }`}
        >
          Barchasi
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border ${
              category === c ? "bg-forest text-parchment border-forest" : "border-forest/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div
        className="flex flex-wrap items-end gap-2.5 pt-7 px-4 pb-3 mb-8 rounded-t"
        style={{
          background: "linear-gradient(180deg, transparent 0%, transparent 82%, rgba(90,60,30,0.35) 82%, rgba(90,60,30,0.35) 100%)",
          borderBottom: "8px solid #5C4630",
        }}
      >
        {books.length === 0 && <div className="py-10 text-center text-ink/60 text-sm w-full">Hech narsa topilmadi.</div>}
        {books.map((b, i) => (
          <motion.button
            key={b.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, duration: 0.25 }}
            onClick={() => setSelected(b)}
            title={b.title}
            whileHover={{ y: -10 }}
            className="w-[52px] h-[190px] rounded-t flex items-center justify-center relative"
            style={{ background: spineColor(b.id), boxShadow: "inset -3px 0 6px rgba(0,0,0,0.18)" }}
          >
            {isReserved(b.id) && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />}
            <span className="spine text-white font-display text-[13px] font-semibold max-h-[168px] overflow-hidden whitespace-nowrap py-2.5">
              {b.title}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <BookDrawer
            book={selected}
            color={spineColor(selected.id)}
            reserved={isReserved(selected.id)}
            onClose={() => setSelected(null)}
            onReserve={handleReserve}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
