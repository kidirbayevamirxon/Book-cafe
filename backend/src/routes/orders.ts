import { Router } from "express";
import { db } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const { items } = req.body as { items: { menuItemId: number; qty: number }[] };
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Savat bo'sh" });
  }

  const getItem = db.prepare("SELECT * FROM menu_items WHERE id = ?");
  let total = 0;
  const resolved = items.map((it) => {
    const menuItem = getItem.get(it.menuItemId) as any;
    if (!menuItem) throw new Error("Mahsulot topilmadi");
    total += menuItem.price * it.qty;
    return { menuItemId: it.menuItemId, qty: it.qty, price: menuItem.price };
  });

  const orderInfo = db.prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)").run(req.userId, total);
  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, menu_item_id, qty, price) VALUES (?, ?, ?, ?)"
  );
  resolved.forEach((r) => insertItem.run(orderInfo.lastInsertRowid, r.menuItemId, r.qty, r.price));

  res.json({ id: orderInfo.lastInsertRowid, total, items: resolved });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.userId) as any[];

  const itemsStmt = db.prepare(
    `SELECT oi.qty, oi.price, m.name FROM order_items oi
     JOIN menu_items m ON m.id = oi.menu_item_id WHERE oi.order_id = ?`
  );
  const full = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(full);
});

export default router;
