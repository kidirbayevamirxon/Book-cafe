import { Router } from "express";
import { db } from "../db";

const router = Router();

/**
 * Haqiqiy kutubxona RFID darvozasi mantig'i:
 * - "exit" (chiqish) darvozasi: agar kitob oldindan tizimda band qilingan bo'lsa (available=0,
 *   faol reservation mavjud) — chiqishga ruxsat beriladi. Aks holda — signal (ruxsatsiz olib chiqish).
 * - "entry" (kirish) darvozasi: agar kitobning faol band qilingan yozuvi bo'lsa — u yopiladi va
 *   kitob yana mavjud deb belgilanadi (qaytarildi).
 */
router.post("/scan", (req, res) => {
  const { tag, gate } = req.body as { tag: string; gate: "exit" | "entry" };
  if (!tag || !gate) return res.status(400).json({ error: "tag va gate maydonlari kerak" });

  const book = db.prepare("SELECT * FROM books WHERE rfid_tag = ?").get(tag) as any;
  if (!book) {
    db.prepare("INSERT INTO rfid_events (tag, gate, result, book_id) VALUES (?, ?, 'unknown_tag', NULL)").run(
      tag,
      gate
    );
    return res.status(404).json({ result: "unknown_tag", message: "Bu teg tizimda ro'yxatdan o'tmagan" });
  }

  const activeReservation = db
    .prepare("SELECT * FROM reservations WHERE book_id = ? AND status = 'active'")
    .get(book.id) as any;

  let result: string;
  let message: string;
  let alarm = false;

  if (gate === "exit") {
    if (activeReservation) {
      result = "allowed";
      message = `"${book.title}" — chiqishga ruxsat etildi. Xayrli mutolaa!`;
    } else {
      result = "alarm";
      alarm = true;
      message = `DIQQAT: "${book.title}" tizimda band qilinmagan holda olib chiqilmoqda!`;
    }
  } else {
    if (activeReservation) {
      db.prepare(
        "UPDATE reservations SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(activeReservation.id);
      db.prepare("UPDATE books SET available = 1 WHERE id = ?").run(book.id);
      result = "returned";
      message = `"${book.title}" muvaffaqiyatli qaytarildi. Rahmat!`;
    } else {
      result = "info";
      message = `"${book.title}" — faol band qilingan yozuv topilmadi, kirish qayd etildi.`;
    }
  }

  db.prepare("INSERT INTO rfid_events (tag, gate, result, book_id) VALUES (?, ?, ?, ?)").run(
    tag,
    gate,
    result,
    book.id
  );

  res.json({ result, message, alarm, book: { id: book.id, title: book.title, author: book.author } });
});

router.get("/events", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT e.*, b.title FROM rfid_events e LEFT JOIN books b ON b.id = e.book_id
       ORDER BY e.created_at DESC LIMIT 25`
    )
    .all();
  res.json(rows);
});

export default router;
