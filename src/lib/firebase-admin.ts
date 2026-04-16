import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error("Missing Firebase Admin environment variables");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

// Lazy getters — initialization deferred until first request, not at build time
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop) {
    return Reflect.get(getFirestore(getFirebaseAdminApp()), prop);
  },
});

export const adminStorage = new Proxy({} as ReturnType<typeof getStorage>, {
  get(_, prop) {
    return Reflect.get(getStorage(getFirebaseAdminApp()), prop);
  },
});
