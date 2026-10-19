// إعداد Firebase — يقرأ المفاتيح من .env.local
// القاعدة المستخدمة: Realtime Database
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** هل تم ربط Firebase فعلياً؟ */
export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function getDb(): Database {
  if (!firebaseReady) {
    throw new Error("Firebase غير مربوط بعد — أضف المفاتيح في .env.local");
  }
  if (!db) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
    db = getDatabase(app);
  }
  return db;
}
