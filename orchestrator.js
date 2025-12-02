import { Groq } from "groq-sdk";
import axios from "axios";

// FASE 6: Optimizador Inteligente
class IntelligentOptimizer {
  constructor() {
    this.cache = new Map();
    this.performanceMetrics = {
      groq: { latency: [], success: 0, failures: 0 },
      huggingface: { latency: [], success: 0, failures: 0 },
      thirdparty: { latency: [], success: 0, failures: 0 }
    };
  }

  selectBestProvider() {
    const metrics = this.performanceMetrics;
    let bestProvider = "groq";
    let bestScore = 0;

    for (const [provider, data] of Object.entries(metrics)) {
      const avgLatency = data.latency.length > 0 
        ? data.latency.reduce((a, b) => a + b, 0) / data.latency.length 
        : 1000;
      const successRate = data.success / (data.success + data.failures || 1);
      const score = (successRate * 100) / (avgLatency / 100);

      if (score > bestScore) {
        bestScore = score;
        bestProvider = provider;
      }
    }

    return bestProvider;
  }

  recordMetric(provider, latency, success) {
    if (this.performanceMetrics[provider]) {
      this.performanceMetrics[provider].latency.push(latency);
      if (success) {
        this.performanceMetrics[provider].success++;
      } else {
        this.performanceMetrics[provider].failures++;
      }
      if (this.performanceMetrics[provider].latency.length > 100) {
        this.performanceMetrics[provider].latency.shift();
      }
    }
  }

  optimizeRequest(message) {
    const cacheKey = `msg_${Buffer.from(message).toString('base64')}`;
    if (this.cache.has(cacheKey)) {
      return { cached: true, data: this.cache.get(cacheKey) };
    }

    const maxLength = 2000;
    const optimizedMessage = message.length > maxLength 
      ? message.substring(0, maxLength) + "..." 
      : message;

    return { cached: false, message: optimizedMessage };
  }

  cacheResponse(message, response) {
    const cacheKey = `msg_${Buffer.from(message).toString('base64')}`;
    this.cache.set(cacheKey, response);
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// FASE 7: Tercer Proveedor (HuggingFace + Fallback)
class ProviderManager {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.huggingfaceKey = process.env.HUGGING_FACE_API_KEY;
    this.thirdPartyKey = process.env.THIRD_PARTY_API_KEY;
  }

  async callGroq(message) {
    try {
      const startTime = Date.now();
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Eres Cherry, un asistente amable y útil." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 2048
      });
      const latency = Date.now() - startTime;
      return {
        success: true,
        reply: completion.choices?.[0]?.message?.content,
        latency,
        provider: "groq"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "groq",
        latency: 0
      };
    }
  }

  async callHuggingFace(message) {
    try {
      if (!this.huggingfaceKey) {
        return { success: false, error: "HuggingFace API key not configured", provider: "huggingface", latency: 0 };
      }

      const startTime = Date.now();
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
        { inputs: message, parameters: { max_length: 500 } },
        {
          headers: { Authorization: `Bearer ${this.huggingfaceKey}` },
          timeout: 30000
        }
      );

      const latency = Date.now() - startTime;

      if (response.data?.[0]?.generated_text) {
        return {
          success: true,
          reply: response.data[0].generated_text,
          latency,
          provider: "huggingface"
        };
      }

      return {
        success: false,
        error: "HuggingFace error",
        provider: "huggingface",
        latency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "huggingface",
        latency: 0
      };
    }
  }

  async callThirdParty(message) {
    try {
      if (!this.thirdPartyKey) {
        return { success: false, error: "Third party API key not configured", provider: "thirdparty", latency: 0 };
      }

      const startTime = Date.now();
      // Placeholder para tercer proveedor
      const response = await axios.post(
        process.env.THIRD_PARTY_URL || "https://api.example.com/v1/chat/completions",
        {
          messages: [{ role: "user", content: message }],
          model: "gpt-3.5-turbo"
        },
        {
          headers: {
            "Authorization": `Bearer ${this.thirdPartyKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const latency = Date.now() - startTime;

      if (response.data?.choices?.[0]?.message?.content) {
        return {
          success: true,
          reply: response.data.choices[0].message.content,
          latency,
          provider: "thirdparty"
        };
      }

      return {
        success: false,
        error: "Third party error",
        provider: "thirdparty",
        latency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: "thirdparty",
        latency: 0
      };
    }
  }

  async callWithFallback(message) {
    const providers = ["groq", "huggingface", "thirdparty"];
    
    for (const provider of providers) {
      let result;
      
      if (provider === "groq") {
        result = await this.callGroq(message);
      } else if (provider === "huggingface") {
        result = await this.callHuggingFace(message);
      } else if (provider === "thirdparty") {
        result = await this.callThirdParty(message);
      }

      if (result.success) {
        return result;
      }
    }

    return {
      success: false,
      error: "All providers failed",
      provider: "none",
      latency: 0
    };
  }
}

// Exportar instancias globales
export const optimizer = new IntelligentOptimizer();
export const providerManager = new ProviderManager();

// Función principal de orquestación
export async function orchestrateRequest(message) {
  const optimized = optimizer.optimizeRequest(message);
  
  if (optimized.cached) {
    return {
      ...optimized.data,
      cached: true
    };
  }

  const selectedProvider = optimizer.selectBestProvider();
  
  let result;
  if (selectedProvider === "groq") {
    result = await providerManager.callGroq(optimized.message);
    if (!result.success) {
      result = await providerManager.callWithFallback(optimized.message);
    }
  } else if (selectedProvider === "huggingface") {
    result = await providerManager.callHuggingFace(optimized.message);
    if (!result.success) {
      result = await providerManager.callWithFallback(optimized.message);
    }
  } else {
    result = await providerManager.callThirdParty(optimized.message);
    if (!result.success) {
      result = await providerManager.callWithFallback(optimized.message);
    }
  }

  if (result.latency) {
    optimizer.recordMetric(result.provider, result.latency, result.success);
  }

  if (result.success) {
    optimizer.cacheResponse(optimized.message, result);
  }

  // Provider Trace
  if (process.env.USE_PROVIDER_TRACE === 'true') {
    return {
      provider: result.provider,
      reply: result.reply || result.error,
      timestamp: new Date().toISOString(),
      cached: false,
      latency: result.latency || 0,
      success: result.success
    };
  }

  return result;
}
