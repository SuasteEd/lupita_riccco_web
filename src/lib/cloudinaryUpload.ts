import imageCompression from 'browser-image-compression'

/*
  Imagen de referencia del pedido personalizado, sin Firebase Storage
  (requiere plan de pago) y sin exponer credenciales: Cloudinary con
  "unsigned upload" — el cloud_name y el upload_preset son públicos por
  diseño (Cloudinary los espera visibles en el cliente), la seguridad la
  da el preset (configurado en su consola para aceptar solo imágenes,
  con límites de tamaño/transformaciones ahí, no una API key/secret).
*/

const MAX_INPUT_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const UPLOAD_TIMEOUT_MS = 30000

export function validateReferenceImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'La imagen debe ser JPG, PNG o WEBP.'
  if (file.size > MAX_INPUT_BYTES) return 'La imagen no debe pesar más de 10 MB.'
  return null
}

async function compress(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  })
}

/** Comprime en el cliente y sube a Cloudinary. Devuelve el secure_url ya alojado. */
export async function uploadReferenceImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    throw new Error('La subida de imágenes no está configurada. Puedes continuar sin adjuntar una.')
  }

  const compressed = await compress(file)

  const formData = new FormData()
  formData.append('file', compressed)
  formData.append('upload_preset', uploadPreset)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La subida tardó demasiado. Puedes reintentar o continuar sin imagen.')
    }
    throw new Error('No pudimos subir la imagen. Revisa tu conexión e intenta de nuevo.')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error('No pudimos subir la imagen. Intenta de nuevo o continúa sin ella.')
  }

  const data: { secure_url?: string } = await response.json()
  if (!data.secure_url) {
    throw new Error('No pudimos subir la imagen. Intenta de nuevo o continúa sin ella.')
  }
  return data.secure_url
}
