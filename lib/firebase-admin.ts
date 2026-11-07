import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import clientConfig from '@/firebase-applet-config.json';

function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n');
}

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || clientConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
    } catch (e) {
      console.warn('Falha ao interpretar FIREBASE_SERVICE_ACCOUNT_KEY. Tentando outras credenciais...', e);
    }
  }

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  // Fallback para Application Default Credentials (ADC)
  return initializeApp({
    projectId,
  });
}

const adminApp = initializeFirebaseAdmin();
export const adminAuth: Auth = getAuth(adminApp);

const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || clientConfig.firestoreDatabaseId;
export const adminDb: Firestore = databaseId && databaseId !== '(default)'
  ? getFirestore(adminApp, databaseId)
  : getFirestore(adminApp);

/**
 * Valida o token ID ou token de sessão do usuário Google autenticado.
 * Útil para rotas de API e Server Actions internas.
 */
export async function verifyUserToken(bearerOrToken?: string | null) {
  if (!bearerOrToken) {
    throw new Error('Token de autenticação não fornecido');
  }

  const token = bearerOrToken.startsWith('Bearer ')
    ? bearerOrToken.slice(7).trim()
    : bearerOrToken.trim();

  return await adminAuth.verifyIdToken(token);
}

/**
 * Verifica se o usuário tem privilégios internos de administrador.
 */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    return !!user.customClaims?.admin;
  } catch {
    return false;
  }
}

/**
 * Concede ou revoga permissões de administrador interno para um usuário.
 */
export async function setAdminClaim(uid: string, isAdmin: boolean = true) {
  const currentClaims = (await adminAuth.getUser(uid)).customClaims || {};
  await adminAuth.setCustomUserClaims(uid, {
    ...currentClaims,
    admin: isAdmin,
  });
}

export { adminApp };
