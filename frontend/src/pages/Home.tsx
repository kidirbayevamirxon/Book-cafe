import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, QrCode, Sun } from "lucide-react";
import { api } from "../api/client";
import { Zone } from "../types";

const SPINE_COLORS = ["#5C4630", "#0F3D2E", "#7A2E2E", "#8A6E2F", "#2E4A6B", "#4B3B57", "#6B4226", "#3B5B45"];

const FEATURES = [
  { icon: BookOpen, title: "AKM hamkorligi", text: "Axborot-kutubxona markazi bilan hamkorlikda kitob fondi doimiy yangilanib boradi.", color: "#0F3D2E" },
  { icon: ShieldCheck, title: "RFID himoya", text: "Har bir kitobga o'rnatilgan chip yo'qolishning oldini oladi va hisobni avtomatlashtiradi.", color: "#2E4A6B" },
  { icon: QrCode, title: "QR va audiozona", text: "Muqovadagi QR-kod orqali kitob annotatsiyasini o'qish yoki audio holatda tinglash mumkin.", color: "#8A6E2F" },
  { icon: Sun, title: "Yashil energiya", text: "Kafe yoritgichlari va texnikasi quyosh panellari orqali ishlaydi — ekologik va tejamkor.", color: "#6B4226" },
];

export default function Home() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [energy, setEnergy] = useState<{ savingsPercent: number } | null>(null);

  useEffect(() => {
    api.get("/zones").then((r) => setZones(r.data)).catch(() => {});
    api.get("/energy").then((r) => setEnergy(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-forest-dark text-parchment">
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gold/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-clay/10 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-end opacity-50" aria-hidden="true">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: 60 + ((i * 37) % 140) }}
              transition={{ delay: i * 0.012, duration: 0.5, ease: "easeOut" }}
              style={{ width: 20, background: SPINE_COLORS[i % SPINE_COLORS.length] }}
              className="mr-0.5"
            />
          ))}
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-24 md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-sm text-gold font-semibold mb-3.5"
          >
            Investorlar uchun taqdimot
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display font-semibold text-4xl md:text-6xl leading-[1.05] -tracking-tight max-w-[15ch] mb-5"
          >
            Kitob bilan qahva bir tomdan bir xil hidga ega.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-[17px] leading-relaxed max-w-[46ch] text-parchment/80 mb-8"
          >
            An'anaviy kutubxona, zamonaviy qahvaxona va IT-texnologiyalarni birlashtirgan "Book-Cafe" — davlat-xususiy
            sheriklik asosida o'zini-o'zi moliyalashtiradigan, quyosh energiyasida ishlaydigan ekologik makon.
            {energy && ` Quyosh panellari kommunal xarajatlarni ~${energy.savingsPercent}% gacha kamaytiradi.`}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex gap-3 flex-wrap"
          >
            <Link to="/katalog" className="bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3.5 hover:opacity-90">
              Katalogni ko'rish
            </Link>
            <Link to="/kafe" className="border border-parchment/40 text-parchment font-bold text-sm rounded px-6 py-3.5 hover:bg-parchment/10">
              Kafe menyusi
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="max-w-[56ch]">
          <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2.5 max-w-[20ch]">Zamonaviy mutolaa muhiti</h2>
          <p className="text-ink/70 text-[15px] leading-relaxed">
            Bugungi kunda yoshlarga faqat kitob emas, qulay va texnologik muhit ham kerak. Loyiha an'anaviy
            kutubxonani raqamli imkoniyatlar bilan birlashtiradi.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-forest/15 border border-forest/15 mt-9">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-parchment p-6"
              style={{ borderTop: `3px solid ${f.color}` }}
            >
              <f.icon size={22} style={{ color: f.color }} className="mb-3.5" />
              <h3 className="font-display font-semibold text-[17px] mb-2">{f.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink/70">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-16 md:pb-20">
        <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2.5">Kafening ichki tuzilishi</h2>
        <p className="text-ink/70 text-[15px] leading-relaxed max-w-[56ch] mb-8">
          Tashrif buyuruvchilarning turli ehtiyojlariga moslashtirilgan to'rtta funksional hudud.
        </p>
        <div className="border-t border-forest/20">
          {zones.map((z, i) => (
            <motion.div
              key={z.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="grid grid-cols-[28px_1fr] md:grid-cols-[40px_220px_1fr] gap-5 py-5 border-b border-forest/20 items-baseline"
            >
              <div className="font-display text-gold text-[15px]">{String(i + 1).padStart(2, "0")}</div>
              <div className="font-bold text-[15px]">{z.name}</div>
              <div className="col-span-2 md:col-span-1 text-sm text-ink/70 leading-relaxed">{z.detail}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4 }}
          className="bg-forest text-parchment rounded-md p-9 md:p-11 flex items-center justify-between gap-6 flex-wrap"
        >
          <div>
            <h3 className="font-display font-semibold text-2xl mb-1.5">Birinchi kitobingizni band qiling</h3>
            <p className="text-parchment/80 text-[14.5px]">
              Katalogdan tanlang, RFID tizimi orqali xavfsiz ravishda o'zingiz bilan olib keting.
            </p>
          </div>
          <Link to="/katalog" className="bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3.5 hover:opacity-90 whitespace-nowrap">
            Katalogga o'tish
          </Link>
        </motion.div>
      </section>
    </>
  );
}
