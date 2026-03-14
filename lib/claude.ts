/**
 * Servicio de Claude AI para filtrar mensajes de SeparApp
 * Asegura que todos los mensajes sean respetuosos y constructivos
 */

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || ''; // Mismo key de OpenAI por ahora

interface FilterResult {
  isAppropriate: boolean;
  reason?: string;
  suggestedEdit?: string;
  severity: 'safe' | 'warning' | 'blocked';
}

/**
 * Filtra un mensaje antes de enviarlo usando Claude AI
 * Detecta contenido ofensivo, agresivo o inapropiado
 */
export async function filterMessage(message: string): Promise<FilterResult> {
  try {
    console.log('🤖 Filtrando mensaje con IA...');

    // Si el mensaje está vacío, es apropiado
    if (!message.trim()) {
      return {
        isAppropriate: true,
        severity: 'safe',
      };
    }

    // Llamar a OpenAI API (usando GPT-4o-mini por rapidez)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un moderador de contenido para una app de coparentalidad.
Tu trabajo es evaluar si los mensajes entre padres separados son apropiados y constructivos.

Criterios para BLOQUEAR un mensaje:
- Insultos directos o indirectos
- Lenguaje ofensivo o grosero
- Amenazas de cualquier tipo
- Sarcasmo hiriente o pasivo-agresivo
- Ataques personales
- Manipulación emocional
- Referencias negativas sobre el otro padre frente a los hijos

Criterios para ADVERTIR (warning):
- Tono ligeramente negativo pero no ofensivo
- Falta de cortesía
- Mensajes que podrían malinterpretarse

Criterios para PERMITIR (safe):
- Mensajes neutrales o positivos
- Coordinación sobre hijos
- Preguntas respetuosas
- Información objetiva

Responde en formato JSON:
{
  "severity": "safe" | "warning" | "blocked",
  "reason": "explicación breve del problema (si aplica)",
  "suggestedEdit": "versión mejorada del mensaje (si aplica)"
}

Responde SOLO con el JSON, sin explicaciones adicionales.`,
          },
          {
            role: 'user',
            content: `Evalúa este mensaje:\n\n"${message}"`,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      // Si falla la API, permitir el mensaje por defecto
      return {
        isAppropriate: true,
        severity: 'safe',
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      // Si no hay respuesta, permitir por defecto
      return {
        isAppropriate: true,
        severity: 'safe',
      };
    }

    const result = JSON.parse(content);

    console.log('✅ Resultado del filtro:', result);

    return {
      isAppropriate: result.severity !== 'blocked',
      reason: result.reason,
      suggestedEdit: result.suggestedEdit,
      severity: result.severity,
    };
  } catch (error) {
    console.error('❌ Error filtering message:', error);
    // En caso de error, permitir el mensaje (fail-open)
    return {
      isAppropriate: true,
      severity: 'safe',
    };
  }
}

/**
 * Versión rápida del filtro que usa reglas básicas (sin IA)
 * Útil para validación inicial antes de llamar a la API
 */
export function quickFilter(message: string): FilterResult {
  const lowerMessage = message.toLowerCase();

  // Lista de palabras prohibidas (expandir según necesidad)
  const bannedWords = [
    'idiota',
    'estúpid',
    'imbécil',
    'pendej',
    'huev',
    'mierda',
    'carajo',
    'puta',
    'hijo de',
    'inútil',
    'basura',
    'maldito',
    'maldita',
  ];

  // Detectar palabras prohibidas
  for (const word of bannedWords) {
    if (lowerMessage.includes(word)) {
      return {
        isAppropriate: false,
        reason: 'El mensaje contiene lenguaje inapropiado',
        severity: 'blocked',
      };
    }
  }

  // Detectar mayúsculas excesivas (GRITAR)
  const upperCaseRatio = (message.match(/[A-Z]/g) || []).length / message.length;
  if (message.length > 10 && upperCaseRatio > 0.7) {
    return {
      isAppropriate: false,
      reason: 'Evita escribir todo en mayúsculas',
      severity: 'warning',
    };
  }

  // Detectar exclamaciones excesivas
  const exclamationCount = (message.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    return {
      isAppropriate: false,
      reason: 'El mensaje parece agresivo',
      severity: 'warning',
    };
  }

  return {
    isAppropriate: true,
    severity: 'safe',
  };
}

/**
 * Valida un mensaje usando ambos filtros (rápido + IA)
 */
export async function validateMessage(message: string): Promise<FilterResult> {
  // Primero, filtro rápido
  const quickResult = quickFilter(message);

  // Si el filtro rápido bloquea, no llamar a la API
  if (quickResult.severity === 'blocked') {
    return quickResult;
  }

  // Si pasa el filtro rápido, usar IA para análisis profundo
  return await filterMessage(message);
}

/**
 * Genera una sugerencia de mensaje mejorado usando IA
 */
export async function suggestBetterMessage(
  originalMessage: string,
  context?: string
): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente que ayuda a padres separados a comunicarse de manera constructiva.
Tu trabajo es reformular mensajes para que sean respetuosos, claros y centrados en el bienestar de los hijos.

Mantén la intención del mensaje original, pero mejora el tono y la forma.
Sé breve y directo. Usa un tono neutral y profesional.`,
          },
          {
            role: 'user',
            content: `Reformula este mensaje de manera más constructiva:\n\n"${originalMessage}"${
              context ? `\n\nContexto: ${context}` : ''
            }`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || originalMessage;
  } catch (error) {
    console.error('Error suggesting better message:', error);
    return originalMessage;
  }
}
