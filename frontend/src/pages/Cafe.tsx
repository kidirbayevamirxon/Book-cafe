import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import { MenuItem } from "../types";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const money = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

export default function Cafe() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    api.get("/menu").then((r) => setMenu(r.data));
  }, []);

  const groups = [...new Set(menu.map((m) => m.category))];

  return (
    <section className="max-w-6xl mx-auto px-5 py-14">
      <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2">Kafe menyusi</h2>
      <p className="text-ink/70 text-[15px] mb-9">Mutolaa paytida tanlab, savatga qo'shing — mini-bar hududidan yetkazib beriladi.</p>

      {groups.map((g) => (
        <div key={g} className="mb-9">
          <h3 className="font-display font-semibold text-lg text-forest mb-1">{g}</h3>
          {menu.filter((m) => m.category === g).map((m) => (
            <div key={m.id} className="flex items-center justify-between py-4 border-b border-dashed border-forest/25 gap-4">
              <div>
                <div className="font-bold text-[15px]">{m.name}</div>
                <div className="text-[13.5px] text-ink/60">{money(m.price)}</div>
              </div>
              <button
                onClick={() => {
                  addToCart(m);
                  showToast(`${m.name} savatga qo'shildi`);
                }}
                className="flex items-center gap-1.5 text-sm font-bold border border-forest text-forest px-3.5 py-2 rounded hover:bg-forest hover:text-parchment whitespace-nowrap"
              >
                <Plus size={14} /> Savatga
              </button>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
