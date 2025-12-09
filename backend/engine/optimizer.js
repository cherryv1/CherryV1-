// CherryV1-Backend/backend/engine/optimizer.js
// FASE 6: Optimización Continua Inteligente

const PROVIDERS = {
    groq: {
        name: 'Groq',
        models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
        costPerToken: 0.0000002, // Ejemplo de costo
        baseLatency: 50, // Latencia base simulada en ms
    },
    huggingface: {
        name: 'Huggingface',
        models: ['HuggingFaceH4/zephyr-7b-beta'],
        costPerToken: 0.0000001, // Ejemplo de costo
        baseLatency: 200, // Latencia base simulada en ms
    }
};

// Almacenamiento simulado de latencia histórica (FASE 6)
let historicalLatency = {
    groq: PROVIDERS.groq.baseLatency,
    huggingface: PROVIDERS.huggingface.baseLatency,
};

/**
 * Selecciona el proveedor y modelo óptimos basado en latencia histórica y costo.
 * @param {string} prompt - El prompt del usuario.
 * @returns {{provider: string, model: string, temperature: number, max_tokens: number}}
 */
function selectOptimalEngine(prompt) {
    let bestProvider = 'groq';
    let minScore = Infinity;

    // Lógica de selección simple: priorizar menor latencia
    for (const [key, provider] of Object.entries(PROVIDERS)) {
        const latency = historicalLatency[key] || provider.baseLatency;
        // Puntuación: Latencia + (Costo * Factor de ponderación)
        // Aquí simplificamos, priorizando la latencia.
        const score = latency;

        if (score < minScore) {
            minScore = score;
            bestProvider = key;
        }
    }

    const selectedProvider = PROVIDERS[bestProvider];
    const selectedModel = selectedProvider.models[0];

    // Ajuste dinámico de parámetros
    const temperature = prompt.length > 100 ? 0.7 : 0.5;
    const max_tokens = prompt.length > 500 ? 2048 : 1024;

    return {
        provider: bestProvider,
        model: selectedModel,
        temperature: temperature,
        max_tokens: max_tokens,
    };
}

/**
 * Actualiza la latencia histórica para el proveedor.
 * @param {string} providerKey - La clave del proveedor ('groq' o 'huggingface').
 * @param {number} newLatency - La nueva latencia medida en ms.
 */
function updateHistoricalLatency(providerKey, newLatency) {
    // Implementación simple de promedio móvil (FASE 6)
    const alpha = 0.2; // Factor de suavizado
    const currentLatency = historicalLatency[providerKey] || PROVIDERS[providerKey].baseLatency;
    historicalLatency[providerKey] = (alpha * newLatency) + ((1 - alpha) * currentLatency);
    console.log(`[Optimizer] Latencia histórica de ${providerKey} actualizada a ${historicalLatency[providerKey].toFixed(2)}ms`);
}

module.exports = {
    selectOptimalEngine,
    updateHistoricalLatency,
    PROVIDERS,
};
