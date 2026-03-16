import { Factus } from "factus-sdk";

/** Singleton Factus SDK instance — reuses token across requests. */
let instance: Factus | null = null;
let loginPromise: Promise<void> | null = null;

function getEnvCredentials() {
  const clientId = process.env.FACTUS_CLIENT_ID;
  const clientSecret = process.env.FACTUS_CLIENT_SECRET;
  const username = process.env.FACTUS_USERNAME;
  const password = process.env.FACTUS_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Faltan variables de entorno FACTUS_*");
  }

  return { clientId, clientSecret, username, password };
}

/** Returns the singleton Factus SDK client, authenticated and ready to use. */
export async function getFactusClient(): Promise<Factus> {
  if (!instance) {
    const env = getEnvCredentials();
    instance = new Factus({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      username: env.username,
      password: env.password,
      environment: "sandbox",
    });
  }

  if (!instance.auth.isAuthenticated()) {
    if (!loginPromise) {
      loginPromise = instance.auth.login().finally(() => {
        loginPromise = null;
      });
    }
    await loginPromise;
  }

  return instance;
}

/** @deprecated Use getFactusClient() instead. Kept for backward compatibility. */
export async function getFactusToken(): Promise<string> {
  const factus = await getFactusClient();
  return factus.getValidToken();
}

/** @deprecated Use getFactusClient() instead. */
export const FACTUS_API_URL = "https://api-sandbox.factus.com.co";
