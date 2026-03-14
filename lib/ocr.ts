/**
 * Servicio de OCR para extraer información de boletas
 * Usa expo-camera y ML Kit para reconocimiento de texto
 */

interface OCRResult {
  amount?: number;
  date?: string;
  merchant?: string;
  rawText: string;
}

/**
 * Extrae información de una imagen de boleta
 * En una implementación real, esto usaría ML Kit o Google Cloud Vision
 * Por ahora, retorna un objeto de ejemplo
 */
export async function extractReceiptData(imageUri: string): Promise<OCRResult> {
  try {
    // TODO: Implementar OCR real con ML Kit o Google Cloud Vision
    // Por ahora, simulamos el proceso

    console.log('Procesando imagen:', imageUri);

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // En producción, aquí iría la lógica real de OCR
    // Ejemplo con ML Kit:
    // const recognizedText = await TextRecognition.recognize(imageUri);
    // const extractedData = parseReceiptText(recognizedText.text);

    return {
      amount: undefined,
      date: undefined,
      merchant: undefined,
      rawText: '',
    };
  } catch (error) {
    console.error('Error in OCR:', error);
    throw new Error('No se pudo procesar la imagen');
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
