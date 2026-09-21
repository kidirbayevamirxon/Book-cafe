import { Check, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";

const money = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

export default function Cart() {
  const { cart, changeQty, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const checkout = async () => {
    if (!user) {
      showToast("Buyurtma berish uchun hisobga kiring");
      navigate("/hisobim");
      return;
    }
    try {
      const items = cart.map((c) => ({ menuItemId: c.menuItemId, qty: c.qty }));
      const { data } = await api.post("/orders", { items });
      clearCart();
      showToast(`Buyurtma qabul qilindi — #${data.id}`);
      navigate("/hisobim");
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-5 py-14">
      <div className="max-w-[460px] mx-auto bg-white border border-forest/20 rounded p-7">
        <h2 className="font-display font-semibold text-xl mb-1">Savat</h2>
        <div className="text-xs text-ink/55 mb-5">Kafe buyurtmasi</div>

        {cart.length === 0 ? (
          <div className="text-center py-10 text-ink/60 text-sm">
            Savat bo'sh.
            <div className="mt-4">
              <Link to="/kafe" className="bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3 inline-block">
                Menyuga o'tish
              </Link>
            </div>
          </div>
        ) : (
          <>
            {cart.map((c) => (
              <div key={c.menuItemId} className="flex items-center justify-between py-3 border-b border-dashed border-forest/25 gap-3">
                <div>
                  <div className="font-bold text-sm">{c.name}</div>
                  <div className="text-xs text-ink/55">{money(c.price)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(c.menuItemId, -1)} className="w-6 h-6 rounded-full border border-forest/35 flex items-center justify-center">
                    <Minus size={13} />
                  </button>
                  <span className="min-w-[16px] text-center text-sm">{c.qty}</span>
                  <button onClick={() => changeQty(c.menuItemId, 1)} className="w-6 h-6 rounded-full border border-forest/35 flex items-center justify-center">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-5 font-extrabold text-base">
              <span>Jami</span>
              <span>{money(total)}</span>
            </div>
            <button
              onClick={checkout}
              className="w-full justify-center flex items-center gap-2 bg-gold text-forest-dark font-bold text-sm rounded px-6 py-3.5 mt-5 hover:opacity-90"
            >
              <Check size={16} /> Buyurtmani rasmiylashtirish
            </button>
          </>
        )}
      </div>
    </section>
  );
}
