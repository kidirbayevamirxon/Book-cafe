import { Router } from "express";
import { db } from "../db";

const router = Router();

// Quyosh panellaridan energiya ishlab chiqarish statistikasi (oxirgi 14 kun)
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT day, generated_kwh, consumed_kwh FROM energy_log ORDER BY day ASC").all() as {
    day: string;
    generated_kwh: number;
    consumed_kwh: number;
  }[];

  const totalGenerated = rows.reduce((s, r) => s + r.generated_kwh, 0);
  const totalConsumed = rows.reduce((s, r) => s + r.consumed_kwh, 0);
  const savingsPercent = totalGenerated > 0 ? Math.round((1 - totalConsumed / totalGenerated) * 100) : 0;

  res.json({ days: rows, totalGenerated, totalConsumed, savingsPercent });
});

// Quyosh panelining joriy ishlab chiqarish quvvati — kun vaqtiga bog'liq
// simulyatsiya (quyosh soat 13:00 da eng yuqori, tunda 0). Haqiqiy panel
// ulanganda bu endpoint shunchaki sensordan o'qishga almashtiriladi.
router.get("/live", (_req, res) => {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const peakKw = 6.5;
  const currentKw = Number((daylight * peakKw * (0.9 + Math.random() * 0.2)).toFixed(2));
  const consumptionKw = Number((1.1 + Math.random() * 0.4).toFixed(2));

  res.json({
    timestamp: now.toISOString(),
    generatingKw: currentKw,
    consumingKw: consumptionKw,
    gridKw: Number((consumptionKw - currentKw).toFixed(2)),
  });
});

export default router;
