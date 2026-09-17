import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    server: process.env.SERVER_ID || "NA",
  });
});

router.get("/send", (req, res) => {
  res.status(200).json({
    message: "Notification sent successfully",
    server: process.env.SERVER_ID || "NA",
  });
});

export default router;
