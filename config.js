// config.js
// Base de configuración para Cherry V3 Ultra

export const ULTRA_CONFIG = {
    // Clave para habilitar el modo Ultra (ej. para endpoints de alto costo)
    MASTER_KEY_REQUIRED: true, 
    
    // Modelos de IA
    MODELS: {
        DEFAULT: "llama-3.3-70b-versatile",
        ULTRA: "llama-3.3-400b-ultra" // Modelo de próxima generación
    },

    // Endpoints de Servicios Externos (Base para HuggingFace, Labs, etc.)
    EXTERNAL_SERVICES: {
        HUGGING_FACE_API: process.env.HUGGING_FACE_API_KEY || null,
        LABS_API: process.env.LABS_API_KEY || null,
        // URL del servicio de generación de imágenes (futura integración)
        IMAGE_GEN_URL: process.env.IMAGE_GEN_URL || "https://ai-image-gen.onrender.com"
    },

    // Opciones de Seguridad
    SECURITY: {
        // Lista de IPs permitidas para acceso directo al backend (ej. para monitoreo)
        ALLOWED_IPS: ["127.0.0.1", "::1"], 
        // Límite de peticiones por minuto (Rate Limiting)
        RATE_LIMIT_PER_MINUTE: 60 
    },

    // Versión del proyecto
    VERSION: "V3 Ultra Base"
};
