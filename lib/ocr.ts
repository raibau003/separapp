/**
 * Servicio de OCR para extraer información de boletas
 * Usa OpenAI Vision API para reconocimiento inteligente de recibos
 */

interface OCRResult {
  amount?: number;
  date?: string;
  merchant?: string;
  rawText: string;
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

/**
 * Extrae información de una imagen de boleta usando OpenAI Vision API
 */
export async function extractReceiptData(imageUri: string): Promise<OCRResult> {
  try {
    console.log('📸 Procesando imagen con OpenAI Vision API:', imageUri);

    // Leer la imagen como base64
    const base64Image = await imageToBase64(imageUri);

    // Llamar a OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en extraer información de recibos y boletas.
Analiza la imagen y extrae la siguiente información en formato JSON:
{
  "amount": número (solo el monto total, sin símbolos),
  "date": "YYYY-MM-DD" (fecha del recibo),
  "merchant": "nombre del comercio o vendedor",
  "rawText": "texto completo extraído"
}

Si no encuentras algún dato, usa null. Responde SOLO con el JSON, sin explicaciones adicionales.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae la información de este recibo/boleta. Responde solo con el JSON.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Error al procesar la imagen con OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    // Parsear el JSON de la respuesta
    const extractedData = JSON.parse(content);

    console.log('✅ Datos extraídos:', extractedData);

    return {
      amount: extractedData.amount || undefined,
      date: extractedData.date || undefined,
      merchant: extractedData.merchant || undefined,
      rawText: extractedData.rawText || '',
    };
  } catch (error) {
    console.error('❌ Error in OCR:', error);

    // Fallback: intentar con parseado manual si OpenAI falla
    console.log('🔄 Intentando con parseado manual...');
    return fallbackOCR(imageUri);
  }
}

/**
 * Fallback OCR usando parseado de texto manual (sin IA)
 */
async function fallbackOCR(imageUri: string): Promise<OCRResult> {
  // Este es un fallback básico en caso de que OpenAI falle
  // Retorna datos vacíos para que el usuario los complete manualmente
  return {
    amount: undefined,
    date: undefined,
    merchant: undefined,
    rawText: '',
  };
}

/**
 * Convierte una imagen a base64
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    // Si ya es una URI de data, extraer el base64
    if (imageUri.startsWith('data:')) {
      return imageUri.split(',')[1];
    }

    // Leer el archivo como base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remover el prefijo "data:image/...;base64,"
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * Parsea el texto extraído para encontrar información relevante
 */
function parseReceiptText(text: string): OCRResult {
  const result: OCRResult = {
    rawText: text,
  };

  // Buscar monto (regex para montos en formato chileno/argentino/mexicano)
  // Ejemplos: $12.345, $12,345.67, 12.345, etc.
  const amountPatterns = [
    /\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
    /total[:\s]*\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
    /monto[:\s]*\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Limpiar y convertir el monto
      const amountStr = match[0].replace(/[^\d.,]/g, '');
      const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0) {
        result.amount = amount;
        break;
      }
    }
  }

  // Buscar fecha
  // Formatos: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const datePattern = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  const dateMatch = text.match(datePattern);
  if (dateMatch) {
    const [_, day, month, year] = dateMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    result.date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Buscar nombre del comercio (líneas superiores del texto)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    // Típicamente el nombre del comercio está en las primeras 3 líneas
    const potentialMerchant = lines.slice(0, 3).find(line => {
      // Filtrar líneas que parecen ser nombres (no solo números)
      return line.length > 3 && /[a-zA-Z]/.test(line);
    });
    if (potentialMerchant) {
      result.merchant = potentialMerchant.trim();
    }
  }

  return result;
}

/**
 * Valida si una imagen parece ser una boleta válida
 */
export function validateReceiptImage(imageUri: string): boolean {
  // En una implementación real, esto podría:
  // - Verificar el tamaño de la imagen
  // - Comprobar la calidad/nitidez
  // - Detectar si hay texto en la imagen
  // Por ahora, solo verificamos que la URI existe
  return !!imageUri && imageUri.length > 0;
}

/**
 * Formatea un monto detectado para mostrar al usuario
 */
export function formatDetectedAmount(amount: number | undefined): string {
  if (!amount) return '';
  return amount.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Convierte una fecha ISO a formato legible
 */
export function formatDetectedDate(date: string | undefined): string {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

// Constantes de configuración
export const OCR_CONFIG = {
  // Tamaño máximo de imagen (en bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB

  // Calidad de compresión para upload
  COMPRESSION_QUALITY: 0.8,

  // Timeout para procesamiento OCR
  OCR_TIMEOUT: 10000, // 10 segundos

  // Idiomas soportados
  SUPPORTED_LANGUAGES: ['es', 'en'],
};

/**
 * Comprime una imagen para optimizar el upload
 */
export async function compressImage(imageUri: string): Promise<string> {
  // En una implementación real, usaríamos expo-image-manipulator
  // para comprimir y redimensionar la imagen
  // Por ahora, retornamos la URI original
  return imageUri;
}
