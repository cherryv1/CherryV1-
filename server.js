import express from "express";
import cors from "cors";
import { orchestrateRequest } from "./orchestrator.js";

const app = express();

// Versión de la aplicación (solo UNA)
const APP_VERSION = "V3 Ultra";

// CORS configurado para permitir el frontend
app.use(
  cors({
    origin: "https://cherry-frontend-5nxs.onrender.com",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-master-key"],
  })
);

app.use(express.json({ limit: "10mb" }));

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

// Endpoint principal POST
app.post("/cherry", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hola, soy Cherry 🍒";

    console.log(`[Cherry V3 Ultra] Mensaje recibido: ${userMessage.substring(0, 50)}...`);

    const result = await orchestrateRequest(userMessage);

    if (result.success === false) {
      return res.status(500).json({
        error: result.error,
        provider: result.provider
      });
    }

    if (process.env.USE_PROVIDER_TRACE === "true") {
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
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// GET /cherry (compatibilidad)
app.get("/cherry", async (req, res) => {
  try {
    const msg = req.query.msg || "";
    const result = await orchestrateRequest(msg);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Error en GET /cherry",
      details: err.message
    });
  }
});

// Rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    availableEndpoints: ["/", "/health", "/cherry"]
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🍒 Cherry V3 Ultra Backend iniciado en puerto ${PORT}`);
});
