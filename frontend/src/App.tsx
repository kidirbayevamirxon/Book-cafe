import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Cafe from "./pages/Cafe";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import BookPublic from "./pages/BookPublic";
import RfidKiosk from "./pages/RfidKiosk";
import Admin from "./pages/Admin";
import { useAuth } from "./context/AuthContext";

function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.995 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Mijoz avval hisobiga kirishi/ochishi shart — bosh sahifa, katalog, kafe,
// savat shu himoya ostida. QR orqali kelgan mehmonlar (/kitob/:id) va
// xodimlar zonasi (/rfid, /admin) bundan mustasno.
function RequireAccount({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/hisobim" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/hisobim" element={<PageFade><Account /></PageFade>} />
            <Route path="/" element={<RequireAccount><PageFade><Home /></PageFade></RequireAccount>} />
            <Route path="/katalog" element={<RequireAccount><PageFade><Catalog /></PageFade></RequireAccount>} />
            <Route path="/kafe" element={<RequireAccount><PageFade><Cafe /></PageFade></RequireAccount>} />
            <Route path="/savat" element={<RequireAccount><PageFade><Cart /></PageFade></RequireAccount>} />
            <Route path="/kitob/:id" element={<PageFade><BookPublic /></PageFade>} />
            <Route path="/rfid" element={<PageFade><RfidKiosk /></PageFade>} />
            <Route path="/admin" element={<PageFade><Admin /></PageFade>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
