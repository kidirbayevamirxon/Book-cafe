import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound, BookPlus, Users, ShoppingBag, Wallet, ShieldAlert, BookMarked,
  TrendingUp, Sun, Zap, Leaf, LayoutDashboard, History,
} from "lucide-react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import AnimatedNumber from "../components/AnimatedNumber";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const money = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

interface Stats {
  totalBooks: number;
  availableBooks: number;
  activeReservations: number;
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  rfidAlarms: number;
  rfidEventsTotal: number;
  byCategory: { category: string; count: number }[];
  topReserved: { title: string; count: number }[];
}
interface EnergyData { days: any[]; totalGenerated: number; totalConsumed: number; savingsPercent: number }
interface Live { generatingKw: number; consumingKw: number; gridKw: number }

const TABS = [
  { id: "stats", label: "Statistika", icon: LayoutDashboard },
  { id: "energy", label: "Energiya", icon: Sun },
  { id: "fund", label: "Fond boshqaruvi", icon: BookPlus },
];

function StatCard({ icon: Icon, label, value, format, delay, accent }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(15,61,46,0.12)" }}
      className="bg-white border border-forest/15 rounded-lg p-5 relative overflow-hidden"
    >
      <motion.div
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full"
        style={{ background: accent + "18" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay }}
      />
      <div className="flex items-center gap-2 text-xs font-bold mb-3 relative" style={{ color: accent }}>
        <Icon size={14} /> {label}
      </div>
      <div className="font-display text-2xl font-semibold text-ink relative">
        <AnimatedNumber value={value} format={format} />
      </div>
    </motion.div>
  );
}

export default function Admin() {
  const { user, adminKey: storedKey } = useAuth();
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"stats" | "energy" | "fund">("stats");

  const [stats, setStats] = useState<Stats | null>(null);
  const [syncLog, setSyncLog] = useState<any[]>([]);
  const [energy, setEnergy] = useState<EnergyData | null>(null);
  const [live, setLive] = useState<Live | null>(null);

  const [form, setForm] = useState({ title: "", author: "", category: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const activeKey = key || storedKey || "";
  const client = useMemo(
    () => axios.create({ baseURL: API_URL, headers: { "x-admin-key": activeKey } }),
    [activeKey]
  );
  const handleLogout = () => {
    setAuthed(false);
    setKey("");
    setError("");
    localStorage.removeItem("adminKey");
  };
  const load = async (useKey?: string) => {
    const c = useKey ? axios.create({ baseURL: API_URL, headers: { "x-admin-key": useKey } }) : client;
    try {
      const [s, l] = await Promise.all([c.get("/admin/stats"), c.get("/admin/sync-log")]);
      setStats(s.data);
      setSyncLog(l.data);
      setAuthed(true);
      setError("");
    } catch {
      setError("Admin kaliti noto'g'ri");
      setAuthed(false);
    }
  };

  // Agar hisob orqali admin sifatida kirilgan bo'lsa — kalitni so'ramasdan avtomatik kirish
  useEffect(() => {
    if (user?.isAdmin && storedKey) load(storedKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, storedKey]);

  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => load(), 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (!authed || tab !== "energy") return;
    axios.get(`${API_URL}/energy`).then((r) => setEnergy(r.data));
    const poll = () => axios.get(`${API_URL}/energy/live`).then((r) => setLive(r.data));
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [authed, tab]);

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post("/admin/books", { ...form, hasAudio: true });
      setForm({ title: "", author: "", category: "", description: "" });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      await load();
    } catch {
      setError("Kitob qo'shishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  if (!authed) {
    return (
      <section className="max-w-md mx-auto px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-forest mb-4">
            <KeyRound size={20} />
            <h2 className="font-display font-semibold text-xl">AKM admin paneli</h2>
          </div>
          <p className="text-sm text-ink/65 mb-5">
            Faqat Axborot-kutubxona markazi xodimlari uchun. Admin hisobingiz bilan{" "}
            <a href="/hisobim" className="text-forest font-semibold underline">Hisobim</a> orqali kirsangiz, bu ekran
            o'tkazib yuboriladi. Yoki kalitni to'g'ridan-to'g'ri kiriting:
          </p>
          <form onSubmit={(e) => { e.preventDefault(); load(key); }} className="flex flex-col gap-3">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              type="password"
              placeholder="Admin kaliti"
              className="border border-forest/30 rounded px-3.5 py-2.5 text-sm bg-white"
            />
            {error && <div className="text-red-700 text-sm">{error}</div>}
            <motion.button whileTap={{ scale: 0.97 }} className="bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3 hover:opacity-90">
              Kirish
            </motion.button>
          </form>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-5 py-14">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-1 flex items-center justify-between gap-4 flex-wrap">
        <div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl">AKM admin paneli</h2>
        <p className="text-ink/70 text-[15px] mb-6">Kitob fondi, band qilishlar, energiya va tizim statistikasi jonli yangilanadi.</p>
        </div>
        <button onClick={handleLogout} className="bg-forest text-white font-bold text-sm rounded px-6 py-3 hover:opacity-90">
          Log out
        </button>
      </motion.div>

      <div className="relative flex gap-1 mb-9 border-b border-forest/15">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className="relative flex items-center gap-1.5 text-sm font-bold px-4 py-3"
          >
            {tab === t.id && (
              <motion.span
                layoutId="admin-tab"
                className="absolute inset-x-0 bottom-0 h-[2.5px] bg-gold"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <t.icon size={15} className={tab === t.id ? "text-forest" : "text-ink/50"} />
            <span className={tab === t.id ? "text-forest" : "text-ink/50"}>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "stats" && stats && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard icon={BookMarked} label="JAMI KITOBLAR" value={stats.totalBooks} delay={0} accent="#0F3D2E" />
              <StatCard icon={BookPlus} label="MAVJUD KITOBLAR" value={stats.availableBooks} delay={0.05} accent="#B9872F" />
              <StatCard icon={TrendingUp} label="FAOL BAND QILISHLAR" value={stats.activeReservations} delay={0.1} accent="#2E4A6B" />
              <StatCard icon={Users} label="FOYDALANUVCHILAR" value={stats.totalUsers} delay={0.15} accent="#8A4B2E" />
              <StatCard icon={ShoppingBag} label="BUYURTMALAR" value={stats.totalOrders} delay={0.2} accent="#0F3D2E" />
              <StatCard icon={Wallet} label="TUSHUM" value={stats.revenue} format={money} delay={0.25} accent="#B9872F" />
              <StatCard icon={ShieldAlert} label="RFID SIGNALLARI" value={stats.rfidAlarms} delay={0.3} accent="#B91C1C" />
              <StatCard icon={History} label="JAMI RFID HODISALARI" value={stats.rfidEventsTotal} delay={0.35} accent="#2E4A6B" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Kategoriya bo'yicha taqsimot</h3>
                <div className="space-y-2.5">
                  {stats.byCategory.map((c, i) => {
                    const pct = stats.totalBooks ? Math.round((c.count / stats.totalBooks) * 100) : 0;
                    return (
                      <div key={c.category}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{c.category}</span>
                          <span>{c.count}</span>
                        </div>
                        <div className="h-2.5 bg-forest/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-forest to-forest-dark"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-3">Eng ko'p band qilingan kitoblar</h3>
                <div className="border border-forest/15 rounded divide-y divide-forest/10">
                  {stats.topReserved.length ? (
                    stats.topReserved.map((t, i) => (
                      <motion.div
                        key={t.title}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex justify-between px-4 py-2.5 text-sm"
                      >
                        <span>{i + 1}. {t.title}</span>
                        <span className="font-bold text-forest">{t.count}</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-ink/55">Hozircha ma'lumot yo'q</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "energy" && (
          <motion.div key="energy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <motion.div key={live?.generatingKw} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="bg-forest text-parchment rounded-lg p-6">
                <div className="flex items-center gap-2 text-gold text-xs font-bold mb-3"><Sun size={14} /> HOZIRGI ISHLAB CHIQARISH</div>
                <div className="font-display text-3xl font-semibold">{live ? live.generatingKw.toFixed(2) : "—"} kW</div>
              </motion.div>
              <motion.div key={"c" + live?.consumingKw} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="bg-white border border-forest/20 rounded-lg p-6">
                <div className="flex items-center gap-2 text-clay text-xs font-bold mb-3"><Zap size={14} /> JORIY SARFIYOT</div>
                <div className="font-display text-3xl font-semibold text-ink">{live ? live.consumingKw.toFixed(2) : "—"} kW</div>
              </motion.div>
              <div className="bg-white border border-forest/20 rounded-lg p-6">
                <div className="flex items-center gap-2 text-forest text-xs font-bold mb-3"><Leaf size={14} /> TEJAMKORLIK (14 KUN)</div>
                <div className="font-display text-3xl font-semibold text-ink">
                  {energy ? <AnimatedNumber value={energy.savingsPercent} format={(n) => n + "%"} /> : "—"}
                </div>
              </div>
            </div>

            <div className="bg-white border border-forest/15 rounded-lg p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Oxirgi 14 kunlik statistika</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={energy?.days || []}>
                  <defs>
                    <linearGradient id="gen2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B9872F" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#B9872F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cons2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F3D2E" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0F3D2E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F3D2E22" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} unit=" kWh" />
                  <Tooltip />
                  <Area type="monotone" dataKey="generated_kwh" name="Ishlab chiqarilgan" stroke="#B9872F" fill="url(#gen2)" strokeWidth={2} animationDuration={900} />
                  <Area type="monotone" dataKey="consumed_kwh" name="Sarflangan" stroke="#0F3D2E" fill="url(#cons2)" strokeWidth={2} animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {tab === "fund" && (
          <motion.div key="fund" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <BookPlus size={18} /> Fondga yangi kitob qo'shish
              </h3>
              <form onSubmit={addBook} className="flex flex-col gap-3 bg-white border border-forest/15 rounded-lg p-5 relative overflow-hidden">
                <AnimatePresence>
                  {justAdded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-forest/95 text-parchment flex items-center justify-center font-display font-semibold text-lg z-10"
                    >
                      Kitob fondga qo'shildi ✓
                    </motion.div>
                  )}
                </AnimatePresence>
                <input required placeholder="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-forest/25 rounded px-3 py-2 text-sm" />
                <input required placeholder="Muallif" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="border border-forest/25 rounded px-3 py-2 text-sm" />
                <input required placeholder="Kategoriya" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-forest/25 rounded px-3 py-2 text-sm" />
                <textarea required placeholder="Qisqacha annotatsiya" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border border-forest/25 rounded px-3 py-2 text-sm" rows={3} />
                <motion.button whileTap={{ scale: 0.97 }} disabled={saving} className="bg-forest text-parchment font-bold text-sm rounded px-5 py-2.5 disabled:opacity-60">
                  {saving ? "Qo'shilmoqda…" : "Fondga qo'shish"}
                </motion.button>
              </form>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg mb-3">So'nggi AKM sinxronizatsiyasi</h3>
              <div className="border border-forest/15 rounded divide-y divide-forest/10 max-h-[360px] overflow-y-auto">
                {syncLog.length === 0 && <div className="px-4 py-3 text-sm text-ink/55">Hozircha yo'q</div>}
                {syncLog.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-4 py-3 text-sm">
                    <div className="font-semibold">{s.note}</div>
                    <div className="text-xs text-ink/50">{new Date(s.created_at).toLocaleString("uz-UZ")}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
