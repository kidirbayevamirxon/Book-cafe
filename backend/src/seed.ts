import bcrypt from "bcryptjs";
import { db } from "./db";

const bookCount = (db.prepare("SELECT COUNT(*) as c FROM books").get() as { c: number }).c;

if (bookCount === 0) {
  const books = [
    ["O'tkan kunlar", "Abdulla Qodiriy", "Badiiy adabiyot", "O'zbek mumtoz nasrining ilk romani — sevgi, xiyonat va davr ziddiyatlari haqida."],
    ["Sapiens", "Yuval Noah Harari", "Ilmiy-ommabop", "Inson turining paydo bo'lishidan hozirgi kungacha bo'lgan yo'li haqida hikoya."],
    ["Kichik shahzoda", "Antoine de Saint-Exupéry", "Bolalar", "Do'stlik va mas'uliyat haqidagi mashhur ertak-qissa."],
    ["Amir Temur tarixi", "Tarixiy risola", "Tarix", "Sohibqiron davri va Movarounnahrdagi qurilish ishlari haqida."],
    ["Atomic Habits", "James Clear", "Biznes va rivojlanish", "Kichik odatlarni qurish va ularning katta natijalari haqida amaliy qo'llanma."],
    ["1984", "George Orwell", "Badiiy adabiyot", "Nazorat ostidagi jamiyat va inson erkinligi haqidagi distopik roman."],
    ["Alkimyogar", "Paulo Coelho", "Badiiy adabiyot", "O'z taqdirini izlagan cho'pon yigitning ramziy sayohati."],
    ["Vaqt qisqacha tarixi", "Stephen Hawking", "Ilmiy-ommabop", "Koinot va vaqt haqida oddiy tilda yozilgan ilmiy kitob."],
    ["Boy Dada, Kambag'al Dada", "Robert Kiyosaki", "Biznes va rivojlanish", "Moliyaviy savodxonlik haqidagi mashhur kitob."],
    ["Alisa mo'jizalar mamlakatida", "Lewis Carroll", "Bolalar", "Xayolot va mantiq uyg'unlashuvi bo'lgan klassik ertak."]
  ];
  const insertBook = db.prepare(
    "INSERT INTO books (title, author, category, description, rfid_tag, has_audio) VALUES (?, ?, ?, ?, ?, 1)"
  );
  books.forEach((b, i) => insertBook.run(b[0], b[1], b[2], b[3], `RFID-${1000 + i}`));

  const menu: [string, string, number][] = [
    ["Espresso", "Qahva", 15000],
    ["Americano", "Qahva", 17000],
    ["Cappuccino", "Qahva", 20000],
    ["Latte", "Qahva", 22000],
    ["Yashil choy", "Choy", 12000],
    ["Asalli qora choy", "Choy", 14000],
    ["Cheesecake", "Shirinlik", 28000],
    ["Kruassan", "Shirinlik", 18000],
    ["Brauni", "Shirinlik", 20000],
    ["Klub sendvich", "Tamaddi", 32000]
  ];
  const insertMenu = db.prepare("INSERT INTO menu_items (name, category, price) VALUES (?, ?, ?)");
  menu.forEach((m) => insertMenu.run(m[0], m[1], m[2]));

  const insertEnergy = db.prepare("INSERT INTO energy_log (day, generated_kwh, consumed_kwh) VALUES (?, ?, ?)");
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    const generated = 18 + Math.random() * 6;
    const consumed = generated * (0.1 + Math.random() * 0.15);
    insertEnergy.run(day, Number(generated.toFixed(2)), Number(consumed.toFixed(2)));
  }

  console.log("Seed ma'lumotlari qo'shildi.");
} else {
  console.log("Ma'lumotlar bazasi allaqachon to'ldirilgan, seed o'tkazib yuborildi.");
}

// Standart AKM admin hisobi — birinchi marta ishga tushirilganda yaratiladi
const adminExists = db.prepare("SELECT id FROM users WHERE is_admin = 1").get();
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, phone, password_hash, is_admin) VALUES (?, ?, ?, 1)").run(
    "AKM Administrator",
    "admin",
    hash
  );
  console.log("Standart admin hisobi yaratildi — telefon: admin, parol: admin123 (ishlab chiqarishda albatta o'zgartiring!)");
}
