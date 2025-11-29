# Cherry V2 Backend 🍒

Backend oficial de Cherry V2 utilizando Groq AI con el modelo Llama 3.3 70B.

## Características

- ✅ API REST con Express.js
- ✅ Integración con Groq AI (Llama 3.3 70B)
- ✅ CORS configurado para frontend
- ✅ Health checks y monitoreo
- ✅ Manejo robusto de errores
- ✅ Soporte para mensajes e imágenes

## Endpoints

- `GET /` - Información del servicio
- `GET /health` - Estado de salud del servidor
- `POST /cherry` - Endpoint principal para chat

## Variables de Entorno

```
GROQ_API_KEY=tu_api_key_de_groq
PORT=3000
NODE_ENV=production
```

## Instalación Local

```bash
npm install
npm start
```

## Despliegue en Render

1. Conectar repositorio en Render
2. Configurar como Web Service
3. Agregar variable de entorno `GROQ_API_KEY`
4. Build Command: `npm install`
5. Start Command: `npm start`

## Licencia

MIT
