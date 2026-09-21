import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/", (req, res) => {
  const { category, q } = req.query as { category?: string; q?: string };
  let sql = "SELECT * FROM books WHERE 1=1";
  const params: any[] = [];
  if (category && category !== "Barchasi") {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND (title LIKE ? OR author LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  const books = db.prepare(sql).all(...params);
  res.json(books);
});

router.get("/categories", (_req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM books").all() as { category: string }[];
  res.json(rows.map((r) => r.category));
});

router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Kitob topilmadi" });
  res.json(book);
});

export default router;
