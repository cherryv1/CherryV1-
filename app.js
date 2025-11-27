import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get("/jarvisito", async (req, res) => {
  try {
    const msg = req.query.msg || "Hola, ¿en qué te ayudo?";

    const response = await client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: "Eres un asistente llamado Jarvisito." },
        { role: "user", content: msg }
      ]
    });

    res.json({
      respuesta: response.choices[0].message.content
    });

  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});
