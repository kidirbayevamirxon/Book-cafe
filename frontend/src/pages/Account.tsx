import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, Volume2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { Reservation, OrderRecord } from "../types";

const money = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

function speakWelcome(name: string) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(`Xush kelibsiz, Book Cafega, ${name}!`);
  utter.lang = "ru-RU";
  utter.rate = 0.98;
  utter.pitch = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function Account() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [greeting, setGreeting] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    if (user) {
      api.get("/reservations/me").then((r) => setReservations(r.data));
      api.get("/orders/me").then((r) => setOrders(r.data));
    }
  }, [user]);

  const submit = async () => {
    setError("");
    try {
      const u = mode === "login" ? await login(phone, password) : await register(name, phone, password);

      if (u.isAdmin) {
        navigate("/admin");
        return;
      }

      setGreeting(`Xush kelibsiz, Book–Cafega, ${u.name}!`);
      speakWelcome(u.name);
      setTimeout(() => {
        setGreeting(null);
        navigate("/");
      }, 2200);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  if (!user) {
    return (
      <section className="max-w-6xl mx-auto px-5 py-16 relative overflow-hidden">
        <AnimatePresence>
          {greeting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[90] bg-forest-dark/95 text-parchment flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                className="w-16 h-16 rounded-full bg-gold flex items-center justify-center"
              >
                <Volume2 size={26} className="text-forest-dark" />
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="font-display font-semibold text-3xl text-center px-6"
              >
                {greeting}
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-[400px] mx-auto"
        >
          <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2 text-center">
            {mode === "login" ? "Hisobga kirish" : "Ro'yxatdan o'tish"}
          </h2>
          <p className="text-ink/70 text-[15px] mb-7 text-center">
            Book–Cafe imkoniyatlaridan foydalanish uchun avval hisobingizga kiring.
          </p>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {mode === "register" && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  placeholder="Ismingiz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-forest/30 rounded px-3.5 py-2.5 text-sm bg-white"
                />
              )}
            </AnimatePresence>
            <input
              placeholder="Telefon raqam"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-forest/30 rounded px-3.5 py-2.5 text-sm bg-white"
            />
            <input
              placeholder="Parol"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-forest/30 rounded px-3.5 py-2.5 text-sm bg-white"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-700 text-sm">
                {error}
              </motion.div>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={submit}
              className="justify-center flex items-center gap-2 bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3.5 hover:opacity-90"
            >
              <UserRound size={16} /> {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
            </motion.button>
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-sm text-forest font-semibold underline underline-offset-2"
            >
              {mode === "login" ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kiring"}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-5 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[440px] bg-forest text-parchment rounded-lg p-7 mb-9 relative overflow-hidden"
      >
        <motion.div
          className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-gold/20"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <div className="text-xs text-gold font-bold mb-4 relative">Kutubxona kartasi</div>
        <h3 className="font-display text-2xl mb-1 relative">{user.name}</h3>
        <div className="text-parchment/75 text-sm relative">{user.phone}</div>
        <button onClick={logout} className="mt-4 border border-parchment/40 text-parchment text-xs font-bold rounded px-3.5 py-2 relative">
          Chiqish
        </button>
      </motion.div>

      <h2 className="font-display font-semibold text-xl mb-4">Band qilingan kitoblar</h2>
      {reservations.length === 0 ? (
        <p className="text-sm text-ink/60 mb-8">Hozircha band qilingan kitob yo'q.</p>
      ) : (
        <div className="mb-9">
          {reservations.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-forest/20 rounded px-4 py-3.5 mb-2.5"
            >
              <div className="font-bold text-sm">{r.title}</div>
              <div className="text-xs text-ink/60">
                {new Date(r.reserved_at).toLocaleDateString("uz-UZ")} · {r.status === "active" ? "Faol" : "Qaytarilgan"}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <h2 className="font-display font-semibold text-xl mb-4">Buyurtmalar tarixi</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-ink/60">Hozircha buyurtma yo'q.</p>
      ) : (
        orders.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-forest/20 rounded px-4 py-3.5 mb-2.5"
          >
            <div className="flex justify-between font-bold text-sm mb-1">
              <span>#{o.id}</span>
              <span>{money(o.total)}</span>
            </div>
            <div className="text-xs text-ink/60">
              {new Date(o.created_at).toLocaleString("uz-UZ")} · {o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}
            </div>
          </motion.div>
        ))
      )}
    </section>
  );
}
