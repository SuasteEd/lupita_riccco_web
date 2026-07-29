/*
  Config de Firebase para el sitio web (mismo proyecto que la app Flutter).
  ------------------------------------------------------------------
  Estos valores NO son secretos en el sentido de una API key de backend —
  Firebase los espera visibles en el bundle del cliente; lo que realmente
  protege tus datos son las Security Rules (ver firestore.rules en la raíz
  del proyecto), no ocultar estos valores.

  Sin Firebase Storage a propósito (MVP): las imágenes de referencia se
  guardan como base64 directo en el documento de Firestore, ver
  src/lib/referenceImage.ts. Si más adelante quieres fotos de mayor
  calidad o quitar peso de los documentos, ahí es donde se migraría a
  Storage.

  Para desplegar las reglas (requiere Firebase CLI, `npm i -g firebase-tools`):
    firebase deploy --only firestore:rules
*/
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBAhhHzOpXDbyHkGHxj6tXRm3A3nKYXGj4',
  authDomain: 'lupitaricco-cd9f9.firebaseapp.com',
  projectId: 'lupitaricco-cd9f9',
  storageBucket: 'lupitaricco-cd9f9.firebasestorage.app',
  messagingSenderId: '1043637803538',
  appId: '1:1043637803538:web:9fbbb6a14a944d0a72d6cb',
  measurementId: 'G-7HJ83FYN0W',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

// Analytics es browser-only y puede no estar disponible en todos los
// contextos (ad-blockers, navegación privada estricta); isSupported()
// evita que un fallo ahí tumbe el resto de la app.
isAnalyticsSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp)
})
