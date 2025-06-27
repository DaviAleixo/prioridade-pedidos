// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL: "http://localhost:3000" // não precisa agora, pq está tudo mock
});
