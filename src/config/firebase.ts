/*
  Config de Firebase para el sitio web (mismo proyecto que la app Flutter).
  ------------------------------------------------------------------
  Estos valores viven en .env por buena práctica y para no disparar los
  escáneres automáticos de "secretos hardcodeados" de GitHub — pero para
  que quede claro: NO son secretos en el sentido de una API key de
  backend. Firebase los espera visibles en el bundle del cliente (se ven
  igual en las devtools de cualquier navegador contra el sitio ya
  desplegado). Lo que realmente protege tus datos son las Security Rules
  (ver firestore.rules en la raíz del proyecto) y (cuando lo actives)
  Firebase App Check, no ocultar estos valores.

  Lo que SÍ sería un secreto real y JAMÁS debe vivir en este repo ni en
  el bundle del cliente: una clave de cuenta de servicio del Admin SDK
  (el JSON que se genera en Project Settings → Service Accounts). Ese
  archivo da acceso total sin pasar por las Security Rules. Este
  proyecto no lo usa en ningún lado — el CLI de Firebase se autentica
  por separado, con tu login de Google, nunca con ese archivo.

  Para desplegar las reglas (requiere Firebase CLI, `npm i -g firebase-tools`):
    firebase deploy --only firestore:rules
*/
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)

// Analytics es browser-only y puede no estar disponible en todos los
// contextos (ad-blockers, navegación privada estricta); isSupported()
// evita que un fallo ahí tumbe el resto de la app.
isAnalyticsSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp)
})
