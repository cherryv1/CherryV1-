// CherryV1-Backend/backend/server.js
// FASE 6.3: Integración del Optimizador

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { selectOptimalEngine, updateHistoricalLatency } = require('./engine/optimizer');
// Se asume que cache.js y monitor.js existen o se crearán más tarde
// const cache = require('./cache');
// const monitor = require('./monitor');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Endpoint principal para la interacción con el modelo
app.post('/cherry', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // 1. Selección del motor óptimo (FASE 6)
        const { provider, model, temperature, max_tokens } = selectOptimalEngine(prompt);
        
        console.log(`[Server] Usando motor óptimo: ${provider} con modelo ${model}`);

        // 2. Simulación de llamada a la API del LLM
        const startTime = Date.now();
        
        // **Aquí iría la lógica real de la llamada a la API del LLM (Groq o Huggingface)**
        // Por ahora, simulamos una respuesta y una latencia.
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 50)); // Latencia simulada
        
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        // Simulación de métricas (FASE 8)
        const simulatedTokens = prompt.length / 4 + 50; // Estimación simple
        
        // 3. Actualización de la latencia histórica (FASE 6)
        updateHistoricalLatency(provider, latency);

        // 4. Registro de métricas (FASE 8 - Simulado)
        // monitor.logMetrics({ provider, model, latency, tokens: simulatedTokens });

        const responseText = `Respuesta generada por ${provider} (${model}) con latencia de ${latency}ms. Tokens simulados: ${simulatedTokens.toFixed(0)}.`;

        res.json({
            response: responseText,
            metadata: {
                provider,
                model,
                latency: `${latency}ms`,
                tokens: simulatedTokens.toFixed(0),
            }
        });

    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(`CherryV1 Backend escuchando en http://localhost:${port}`);
});
