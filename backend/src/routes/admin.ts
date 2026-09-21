import { Router } from "express";
import { db } from "../db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// AKM xodimi yangi kitob qo'shadi — kitob fondi shu yerdan "yangilanadi"
router.post("/books", requireAdmin, (req, res) => {
  const { title, author, category, description, hasAudio } = req.body;
  if (!title || !author || !category || !description) {
    return res.status(400).json({ error: "Barcha maydonlar to'ldirilishi shart" });
  }
  const rfidTag = `RFID-${Date.now().toString(36).toUpperCase()}`;
  const info = db
    .prepare(
      `INSERT INTO books (title, author, category, description, rfid_tag, has_audio, source)
       VALUES (?, ?, ?, ?, ?, ?, 'AKM')`
    )
    .run(title, author, category, description, rfidTag, hasAudio ? 1 : 0);

  db.prepare("INSERT INTO akm_sync_log (book_id, action, note) VALUES (?, 'added', ?)").run(
    info.lastInsertRowid,
    `"${title}" AKM tomonidan fondga qo'shildi`
  );

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(info.lastInsertRowid);
  res.json(book);
});

router.delete("/books/:id", requireAdmin, (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id) as any;
  if (!book) return res.status(404).json({ error: "Kitob topilmadi" });

  db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
  db.prepare("INSERT INTO akm_sync_log (book_id, action, note) VALUES (?, 'removed', ?)").run(
    null,
    `"${book.title}" fonddan chiqarildi`
  );
  res.json({ ok: true });
});

// Oxirgi AKM sinxronizatsiya voqealari — sayt/katalogda "so'nggi yangilanish" sifatida ko'rsatiladi
router.get("/sync-log", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM akm_sync_log ORDER BY created_at DESC LIMIT 20")
    .all();
  res.json(rows);
});

// AKM admin panel uchun umumiy statistika
router.get("/stats", requireAdmin, (_req, res) => {
  const totalBooks = (db.prepare("SELECT COUNT(*) c FROM books").get() as any).c;
  const availableBooks = (db.prepare("SELECT COUNT(*) c FROM books WHERE available = 1").get() as any).c;
  const activeReservations = (
    db.prepare("SELECT COUNT(*) c FROM reservations WHERE status = 'active'").get() as any
  ).c;
  const totalUsers = (db.prepare("SELECT COUNT(*) c FROM users").get() as any).c;
  const totalOrders = (db.prepare("SELECT COUNT(*) c FROM orders").get() as any).c;
  const revenue = (db.prepare("SELECT COALESCE(SUM(total),0) s FROM orders").get() as any).s;
  const rfidAlarms = (
    db.prepare("SELECT COUNT(*) c FROM rfid_events WHERE result = 'alarm'").get() as any
  ).c;
  const rfidEventsTotal = (db.prepare("SELECT COUNT(*) c FROM rfid_events").get() as any).c;
  const byCategory = db
    .prepare("SELECT category, COUNT(*) count FROM books GROUP BY category ORDER BY count DESC")
    .all();
  const topReserved = db
    .prepare(
      `SELECT b.title, COUNT(*) count FROM reservations r JOIN books b ON b.id = r.book_id
       GROUP BY r.book_id ORDER BY count DESC LIMIT 5`
    )
    .all();

  res.json({
    totalBooks,
    availableBooks,
    activeReservations,
    totalUsers,
    totalOrders,
    revenue,
    rfidAlarms,
    rfidEventsTotal,
    byCategory,
    topReserved,
  });
});

export default router;
