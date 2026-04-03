import { Buffer } from "buffer";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const getCredential = () => {
  const base64Config = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (base64Config) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(base64Config, "base64").toString("utf-8"));
      return cert(serviceAccount);
    } catch (error) {
      console.warn(
        "Warning: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64. It might be malformed or truncated. Falling back to application default credentials.",
        error
      );
    }
  }

  return applicationDefault();
};

const defaultApp =
  getApps()[0] ??
  initializeApp({
    credential: getCredential(),
  });

export const auth = getAuth(defaultApp);
