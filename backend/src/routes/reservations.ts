import { Router } from "express";
import { db } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

// Kitobni RFID orqali band qilish
router.post("/", requireAuth, (req: AuthedRequest, res) => {
  const { bookId } = req.body;
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId) as any;
  if (!book) return res.status(404).json({ error: "Kitob topilmadi" });
  if (!book.available) return res.status(409).json({ error: "Kitob hozircha band qilingan" });

  const already = db
    .prepare("SELECT id FROM reservations WHERE user_id = ? AND book_id = ? AND status = 'active'")
    .get(req.userId, bookId);
  if (already) return res.status(409).json({ error: "Siz bu kitobni allaqachon band qilgansiz" });

  const info = db
    .prepare("INSERT INTO reservations (user_id, book_id) VALUES (?, ?)")
    .run(req.userId, bookId);
  db.prepare("UPDATE books SET available = 0 WHERE id = ?").run(bookId);

  res.json({ id: info.lastInsertRowid, bookId, rfidTag: book.rfid_tag, status: "active" });
});

router.get("/me", requireAuth, (req: AuthedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT r.id, r.status, r.reserved_at, b.id as book_id, b.title, b.author
       FROM reservations r JOIN books b ON b.id = r.book_id
       WHERE r.user_id = ? ORDER BY r.reserved_at DESC`
    )
    .all(req.userId);
  res.json(rows);
});

// Kitobni qaytarish (RFID skanerdan chiqarilganda backend shu endpointni chaqiradi)
router.post("/:id/return", requireAuth, (req: AuthedRequest, res) => {
  const reservation = db.prepare("SELECT * FROM reservations WHERE id = ? AND user_id = ?").get(
    req.params.id,
    req.userId
  ) as any;
  if (!reservation) return res.status(404).json({ error: "Band qilish topilmadi" });

  db.prepare("UPDATE reservations SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    reservation.id
  );
  db.prepare("UPDATE books SET available = 1 WHERE id = ?").run(reservation.book_id);
  res.json({ ok: true });
});

export default router;
