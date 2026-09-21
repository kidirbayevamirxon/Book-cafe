import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

router.post("/register", (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "Ism, telefon va parol talab qilinadi" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE phone = ?").get(phone);
  if (existing) {
    return res.status(409).json({ error: "Bu telefon raqam bilan hisob allaqachon mavjud" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, phone, password_hash) VALUES (?, ?, ?)")
    .run(name, phone, hash);
  const token = jwt.sign({ userId: info.lastInsertRowid }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: info.lastInsertRowid, name, phone, isAdmin: false } });
});

router.post("/login", (req, res) => {
  const { phone, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as
    | { id: number; name: string; phone: string; password_hash: string; is_admin: number }
    | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Telefon raqam yoki parol noto'g'ri" });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
  const isAdmin = !!user.is_admin;
  res.json({
    token,
    user: { id: user.id, name: user.name, phone: user.phone, isAdmin },
    // Admin bo'lsa, admin panelga avtomatik kirish uchun kalit birga yuboriladi.
    // (Demo uchun soddalashtirilgan — real loyihada bu alohida, qisqa muddatli
    // sessiya sifatida amalga oshirilishi tavsiya etiladi.)
    adminKey: isAdmin ? process.env.ADMIN_KEY || "akm-demo-key" : undefined,
  });
});

export default router;
