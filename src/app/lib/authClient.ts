import { getAuth } from "firebase/auth";
import { appInstance as app } from "./firebaseClient";

export const auth = getAuth(app);
console.log("✅ AuthClient caricato correttamente");
