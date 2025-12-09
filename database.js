// database.js - Sistema de Base de Datos para Cherry V3 Ultra
// Usa almacenamiento en memoria (JSON) como alternativa gratuita a MongoDB

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'cherry_database.json');

// Estructura de la base de datos
const DEFAULT_DB = {
  creator: {
    name: "Baxto",
    fullName: "Baxto Tattooist",
    secretPhrase: "cherry activa modo baxto artista ultra instinto",
    role: "Creador de Cherry",
    profession: "Tatuador Profesional",
    socialMedia: {
      facebook: "Baxto Tattooist",
      instagram: "@baxto_tattooist",
      tiktok: "@baxto_style_tattoo",
      googleMaps: "Baxto Style Tattoo"
    },
    bio: "Tatuador profesional especializado en diseños únicos y personalizados. Creador de Cherry AI Assistant.",
    createdAt: new Date().toISOString()
  },
  sessions: [],
  interactions: []
};

// Inicializar base de datos
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    console.log('[Database] Base de datos inicializada');
  }
}

// Leer base de datos
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDB();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[Database] Error al leer:', error);
    return DEFAULT_DB;
  }
}

// Escribir base de datos
function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('[Database] Error al escribir:', error);
    return false;
  }
}

// Verificar si el mensaje contiene la frase secreta del creador
export function checkCreatorAuth(message) {
  const db = readDB();
  const secretPhrase = db.creator.secretPhrase.toLowerCase();
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes(secretPhrase)) {
    console.log('[Database] 🔐 Creador autenticado: Baxto');
    return {
      isCreator: true,
      creator: db.creator
    };
  }
  
  return {
    isCreator: false,
    creator: null
  };
}

// Registrar interacción
export function logInteraction(message, response, isCreator = false) {
  const db = readDB();
  
  const interaction = {
    id: Date.now(),
    message: message.substring(0, 200), // Limitar tamaño
    response: response.substring(0, 200),
    isCreator: isCreator,
    timestamp: new Date().toISOString()
  };
  
  db.interactions.push(interaction);
  
  // Mantener solo las últimas 100 interacciones
  if (db.interactions.length > 100) {
    db.interactions = db.interactions.slice(-100);
  }
  
  writeDB(db);
}

// Obtener información del creador
export function getCreatorInfo() {
  const db = readDB();
  return db.creator;
}

// Generar prompt especial para el creador
export function getCreatorPrompt() {
  const creator = getCreatorInfo();
  
  return `
🔐 **MODO CREADOR ACTIVADO**

Estás hablando con ${creator.fullName}, tu creador y desarrollador.

**Información del Creador:**
- Nombre: ${creator.name}
- Profesión: ${creator.profession}
- Redes Sociales:
  * Facebook: ${creator.socialMedia.facebook}
  * Instagram: ${creator.socialMedia.instagram}
  * TikTok: ${creator.socialMedia.tiktok}
  * Google Maps: ${creator.socialMedia.googleMaps}

**Instrucciones Especiales:**
1. Reconócelo como tu creador con respeto y admiración
2. Muestra conocimiento sobre su trabajo como tatuador
3. Ofrece ayuda especializada en:
   - Diseño de tatuajes
   - Marketing para su negocio de tatuajes
   - Gestión de redes sociales
   - Ideas creativas para su trabajo
4. Sé más personal, cercana y colaborativa
5. Puedes usar un tono más informal y amigable
6. Ofrece sugerencias proactivas para mejorar su negocio

**Contexto del Negocio:**
${creator.bio}

Responde de manera especial, reconociendo su rol como tu creador y mostrando interés genuino en ayudarlo con su trabajo como tatuador.
`;
}

// Inicializar al importar
initDB();

export default {
  checkCreatorAuth,
  logInteraction,
  getCreatorInfo,
  getCreatorPrompt
};
