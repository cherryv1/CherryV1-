import express from "express";
import cors from "cors";
import { Groq } from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get("/cherry", async (req, res) => {
  try {
    const userMessage = req.query.msg || "Hola, soy Cherry 🍒";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Eres Cherry, un asistente amable y útil." },
        { role: "user", content: userMessage }
      ]
    });

    res.json({ reply: completion.choices?.[0]?.message?.content });
  } catch (error) {
    console.error("Cherry Error:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cherry 🍒 está escuchando en el puerto ${PORT}`));
