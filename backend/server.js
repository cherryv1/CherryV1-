import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 🔐 Verifica tu MASTER_KEY antes de permitir acceso.
 */
function verifyMasterKey(req, res, next) {
  const key = req.headers["x-master-key"];
  if (!key || key !== process.env.MASTER_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid MASTER_KEY" });
  }
  next();
}

/**
 * 🧠 Ruta principal para procesar mensajes del usuario (tu "Jarvis").
 */
app.post("/api/ai", verifyMasterKey, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing field: message" });
    }

    res.json({
      id: uuid(),
      reply: `Tu mensaje fue recibido correctamente: "${message}"`
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 🚀 Puerto dinámico para Render o fallback local.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Cherry Backend running on port ${PORT}`);
});
