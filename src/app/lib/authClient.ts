import { getAuth } from "firebase/auth";
import { app } from "./firebaseClient";

export const auth = getAuth(app);
console.log("✅ AuthClient caricato correttamente");
