import { Router } from "express";

const router = Router();

const ZONES = [
  { id: 1, name: "Kirish va fotozona", detail: "Kitoblardan yasalgan me'moriy bezaklar va adabiy qahramonlar haykalchalari." },
  { id: 2, name: "Mutolaa va IT-hudud", detail: "Qulay o'rindiqlar, tezkor Wi-Fi va zamonaviy kompyuterlar bilan jihozlangan." },
  { id: 3, name: "Bolalar maydonchasi", detail: "Yumshoq qoplama va interaktiv o'yin-o'quv jihozlari mavjud." },
  { id: 4, name: "Mini-bar (qahvaxona)", detail: "Professional qahva mashinalari va shoxobcha bilan xizmat ko'rsatiladi." },
];

router.get("/", (_req, res) => res.json(ZONES));

export default router;
