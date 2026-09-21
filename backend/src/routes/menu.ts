import { Router } from "express";
import { db } from "../db";

const router = Router();

router.get("/", (_req, res) => {
  const items = db.prepare("SELECT * FROM menu_items ORDER BY category").all();
  res.json(items);
});

export default router;
