import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import bookRoutes from "./routes/books";
import reservationRoutes from "./routes/reservations";
import menuRoutes from "./routes/menu";
import orderRoutes from "./routes/orders";
import zoneRoutes from "./routes/zones";
import energyRoutes from "./routes/energy";
import adminRoutes from "./routes/admin";
import rfidRoutes from "./routes/rfid";
import "./seed"; // birinchi ishga tushirishda ma'lumotlarni to'ldiradi

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rfid", rfidRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Book-Cafe backend http://localhost:${PORT} portida ishga tushdi`);
});
