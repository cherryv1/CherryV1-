import axios from "axios";
import { ULTRA_CONFIG } from "./config.js";

const latencyLog = {
    GROQ: [],
    HUGGINGFACE: [],
    THIRD_PARTY: []
};

// --- Funciones de utilidad ---
function recordLatency(provider, ms) {
    latencyLog[provider].push(ms);
    if (latencyLog[provider].length > 20) {
        latencyLog[provider].shift(); // Mantener últimas 20
    }
}

function avgLatency(provider) {
    const data = latencyLog[provider];
    if (!data.length) return 9999;
    return data.reduce((a, b) => a + b, 0) / data.length;
}

function dynamicTemperature(prompt) {
    if (!ULTRA_CONFIG.PERFORMANCE.DYNAMIC_TEMPERATURE) return 0.7;

    // Prompt largo = baja temperatura
    if (prompt.length > 3000) return 0.3;

    // Tatuajes, estilo Baxto = más creativo
    if (/tatuaje|tattoo|baxto/i.test(prompt)) return 0.9;

    return 0.7;
}

// Auto-selector de modelo
function autoModelSelector() {
    const gLat = avgLatency("GROQ");
    const hLat = avgLatency("HUGGINGFACE");
    const tLat = avgLatency("THIRD_PARTY");

    // Ultra si todo está estable
    if (gLat < 800 && hLat < 900) {
        return ULTRA_CONFIG.MODELS.ULTRA;
    }

    // Normal si uno está lento
    if (gLat < 1500 || hLat < 1500) {
        return ULTRA_CONFIG.MODELS.DEFAULT;
    }

    // Fallback si todo está mal
    return ULTRA_CONFIG.MODELS.FALLBACK;
}

// Selector de proveedor basado en latencia y disponibilidad
function selectProvider() {
    const g = avgLatency("GROQ");
    const h = avgLatency("HUGGINGFACE");
    const t = avgLatency("THIRD_PARTY");

    // Orden ascendente
    const sorted = [
        { name: "GROQ", lat: g },
        { name: "HUGGINGFACE", lat: h },
        { name: "THIRD_PARTY", lat: t }
    ].sort((a, b) => a.lat - b.lat);

    return sorted.map(p => p.name); // Retorna lista ordenada
}

// --- PETICIONES A PROVEEDORES ---
// GROQ
async function callGroq(prompt, model, temp) {
    const start = Date.now();
    try {
        const res = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: temp,
                max_tokens: ULTRA_CONFIG.PERFORMANCE.MAX_TOKENS
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );
        recordLatency("GROQ", Date.now() - start);
        return res.data.choices[0].message.content;
    } catch {
        recordLatency("GROQ", 3000); // penalidad
        throw new Error("GROQ failed");
    }
}

// HuggingFace
async function callHuggingFace(prompt, model, temp) {
    const start = Date.now();
    try {
        const res = await axios.post(
            "https://api-inference.huggingface.co/models/" + model,
            { inputs: prompt, parameters: { temperature: temp } },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                }
            }
        );
        recordLatency("HUGGINGFACE", Date.now() - start);
        return res.data[0].generated_text;
    } catch {
        recordLatency("HUGGINGFACE", 3000);
        throw new Error("HF failed");
    }
}

// Third Party
async function callThirdParty(prompt, model, temp) {
    const start = Date.now();
    try {
        const res = await axios.post(
            process.env.THIRD_PARTY_URL,
            {
                model,
                prompt,
                temperature: temp,
                max_tokens: ULTRA_CONFIG.PERFORMANCE.MAX_TOKENS
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.THIRD_PARTY_API_KEY}`
                }
            }
        );
        recordLatency("THIRD_PARTY", Date.now() - start);
        return res.data.output;
    } catch {
        recordLatency("THIRD_PARTY", 3000);
        throw new Error("TP failed");
    }
}

// --- FUNCIÓN PRINCIPAL ---
export async function getOptimizedResponse(prompt) {
    const temp = dynamicTemperature(prompt);
    const model = autoModelSelector();
    const providersOrdered = selectProvider();

    for (const provider of providersOrdered) {
        try {
            if (provider === "GROQ") {
                return await callGroq(prompt, model, temp);
            }
            if (provider === "HUGGINGFACE") {
                return await callHuggingFace(prompt, model, temp);
            }
            if (provider === "THIRD_PARTY") {
                return await callThirdParty(prompt, model, temp);
            }
        } catch (err) {
            console.log(`⚠️ ${provider} falló, intentando siguiente...`);
        }
    }

    return "Todos los proveedores fallaron. Intenta de nuevo.";
}
