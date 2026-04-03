import type { DecodedIdToken } from "firebase-admin/auth";

export type VerifiedFirebaseUser = {
  uid: string;
  email: string;
  name: string | null;
  decodedToken: DecodedIdToken;
};

export type AppBindings = {
  Variables: {
    firebaseUser: VerifiedFirebaseUser;
  };
};
