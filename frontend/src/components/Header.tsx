import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingBag, Menu as MenuIcon, UserRound } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/hisobim", label: "Hisobim" },
  { to: "/", label: "Bosh sahifa" },
  { to: "/katalog", label: "Katalog" },
  { to: "/kafe", label: "Kafe menyusi" },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-parchment/90 backdrop-blur border-b border-forest/15">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <motion.button whileTap={{ scale: 0.96 }} className="flex items-center gap-2" onClick={() => navigate("/")}>
          <motion.div
            whileHover={{ rotate: -8, scale: 1.06 }}
            className="w-9 h-9 rounded bg-forest flex items-center justify-center text-parchment"
          >
            <BookOpen size={18} />
          </motion.div>
          <span className="font-display font-semibold text-lg -tracking-tight">Book–Cafe</span>
        </motion.button>

        <nav className="hidden md:flex items-center gap-1 relative">
          {LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className="relative text-sm font-semibold px-3 py-2 rounded">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-forest/10 rounded"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? "text-forest" : "text-ink hover:text-forest"}`}>
                  {l.to === "/hisobim" && user ? user.name.split(" ")[0] : l.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {user && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-forest bg-forest/10 rounded-full px-3 py-1.5 mr-1">
              <UserRound size={13} /> {user.name.split(" ")[0]}
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-forest/[0.08]"
            onClick={() => navigate("/savat")}
            aria-label="Savat"
          >
            <ShoppingBag size={19} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-clay text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <button
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-forest/[0.08]"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menyu"
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden flex flex-col gap-1 px-5 pb-4 border-t border-forest/15 pt-2 overflow-hidden"
          >
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`text-sm font-semibold px-3 py-2 rounded text-left ${
                  pathname === l.to ? "text-forest bg-forest/10" : "text-ink"
                }`}
              >
                {l.to === "/hisobim" && user ? user.name : l.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
