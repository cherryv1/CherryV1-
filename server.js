import express from "express";
import cors from "cors";
import { Groq } from "groq-sdk";

const app = express();

// CORS configurado para permitir el frontend
app.use(
  cors({
    origin: "https://cherry-frontend-5nxs.onrender.com",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-master-key"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Inicializar Groq con API key desde variables de entorno
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Cherry V2 Backend",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Endpoint principal de Cherry
app.post("/cherry", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hola, soy Cherry 🍒";
    const imageData = req.body.image || null;

    console.log(`[Cherry] Mensaje recibido: ${userMessage.substring(0, 50)}...`);

    // Preparar mensajes para Groq
    const messages = [
      { 
        role: "system", 
        content: "Eres Cherry, un asistente de IA amable, útil y profesional. Respondes en español de manera clara y concisa."
      },
      { 
        role: "user", 
        content: userMessage 
      }
    ];

    // Si hay imagen, agregar contexto (Groq no soporta visión directamente, pero podemos mejorar el prompt)
    if (imageData) {
      messages[1].content = `[El usuario ha compartido una imagen] ${userMessage}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    const reply = completion.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";
    
    console.log(`[Cherry] Respuesta generada: ${reply.substring(0, 50)}...`);

    res.json({ 
      reply: reply,
      model: "llama-3.3-70b-versatile",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[Cherry Error]:", error.message);
    
    // Manejo de errores específicos
    if (error.message.includes("API key")) {
      return res.status(500).json({ 
        error: "Error de configuración del servidor",
        details: "API key no configurada correctamente"
      });
    }

    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    availableEndpoints: ["/", "/health", "/cherry"]
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🍒 Cherry V2 Backend está escuchando en el puerto ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Iniciado: ${new Date().toISOString()}`);
});
