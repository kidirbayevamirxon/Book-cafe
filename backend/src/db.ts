import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "bookcafe.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  rfid_tag TEXT UNIQUE NOT NULL,
  has_audio INTEGER DEFAULT 1,
  available INTEGER DEFAULT 1,
  source TEXT DEFAULT 'AKM',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- user_id NULL bo'lishi mumkin: RFID darvozasi orqali login qilmasdan ham
-- kitob chiqishi/kirishi qayd etiladi (jismoniy kiosk stsenariysi)
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  channel TEXT DEFAULT 'app',
  reserved_at TEXT DEFAULT CURRENT_TIMESTAMP,
  returned_at TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  qty INTEGER NOT NULL,
  price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS energy_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  generated_kwh REAL NOT NULL,
  consumed_kwh REAL NOT NULL
);

-- AKM (Axborot-kutubxona markazi) tomonidan kiritilgan har bir o'zgarish shu yerda qayd etiladi
CREATE TABLE IF NOT EXISTS akm_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER REFERENCES books(id),
  action TEXT NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Har bir RFID skanerlash hodisasi (kirish/chiqish darvozasi) shu yerda saqlanadi
CREATE TABLE IF NOT EXISTS rfid_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag TEXT NOT NULL,
  gate TEXT NOT NULL,
  result TEXT NOT NULL,
  book_id INTEGER REFERENCES books(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);
