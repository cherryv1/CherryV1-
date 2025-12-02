import express from "express";
import cors from "cors";
import { orchestrateRequest } from "./orchestrator.js";

const app = express();

// Versión de la aplicación
const APP_VERSION = "V3 Max";

// CORS configurado para permitir el frontend
app.use(
  cors({
    origin: "https://cherry-frontend-5nxs.onrender.com",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-master-key"],
  })
);

app.use(express.json({ limit: "10mb" }));

// Versión mejorada con FASE 6 + FASE 7 + Provider Trace
const APP_VERSION = "V3 Ultra"; // Actualizado a Ultra con optimizador

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Cherry V3 Ultra Backend",
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    features: ["FASE 6 - Optimizador Inteligente", "FASE 7 - Tercer Proveedor", "Provider Trace"]
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    version: APP_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Endpoint principal de Cherry con FASE 6 + FASE 7 + Provider Trace
app.post("/cherry", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hola, soy Cherry 🍒";
    const imageData = req.body.image || null;

    console.log(`[Cherry V3 Ultra] Mensaje recibido: ${userMessage.substring(0, 50)}...`);

    // Usar orchestrator con FASE 6 + FASE 7 + Provider Trace
    const result = await orchestrateRequest(userMessage);

    if (result.success === false) {
      console.error(`[Cherry Error] ${result.error}`);
      return res.status(500).json({ 
        error: result.error || "Error al procesar la solicitud",
        provider: result.provider
      });
    }

    console.log(`[Cherry V3 Ultra] Respuesta generada por ${result.provider}: ${result.reply.substring(0, 50)}...`);

    // Provider Trace
    if (process.env.USE_PROVIDER_TRACE === 'true') {
      return res.json({
        provider: result.provider,
        reply: result.reply,
        timestamp: result.timestamp,
        cached: result.cached || false,
        latency: result.latency || 0,
        model: "V3 Ultra Multi-Provider"
      });
    }

    res.json({ 
      reply: result.reply,
      model: "V3 Ultra",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[Cherry Error]:", error.message);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
});

// GET endpoint para /cherry (compatibilidad)
app.get("/cherry", async (req, res) => {
  try {
    const msg = req.query.msg || "Hola, ¿en qué te puedo ayudar?";
    const result = await orchestrateRequest(msg);

    if (result.success === false) {
      return res.status(500).json({ error: result.error });
    }

    if (process.env.USE_PROVIDER_TRACE === 'true') {
      return res.json({
        provider: result.provider,
        reply: result.reply,
        timestamp: result.timestamp,
        cached: result.cached || false,
        latency: result.latency || 0
      });
    }

    res.json({ reply: result.reply });
  } catch (error) {
    console.error("[Cherry GET Error]:", error.message);
    res.status(500).json({ error: error.message });
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
