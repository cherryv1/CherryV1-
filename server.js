import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Inicializar GROQ con tu API KEY
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🔐 Middleware para validar MASTER_KEY
function verifyMasterKey(req, res, next) {
  const key = req.headers["x-master-key"];
  if (!key || key !== process.env.MASTER_KEY) {
    return res.status(401).json({ error: "Unauthorized: Invalid MASTER_KEY" });
  }
  next();
}

/**
 * 🧠 Ruta principal Jarvis /api/ai
 */
app.post("/api/ai", verifyMasterKey, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing field: message" });
    }

    const completion = await client.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content:
            "Eres Jarvisito, un asistente inteligente, rápido, con humor y respuestas claras.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({
      id: uuid(),
      reply,
    });
  } catch (err) {
    console.error("❌ Error en la API:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
});

/**
 * 🚀 Puerto dinámico
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Cherry Backend online on port ${PORT}`);
});
