// ⬇️ BLOCCO 1: AuthClient completo e tipizzato
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "./firebaseClient";

export const auth = getAuth(app);

// ✅ Tipizzazione dell'utente
interface UserData {
  uid: string;
  email: string | null;
  role: string;
}

// ✅ Hook personalizzato per gestire l'utente loggato
export const useAuthUser = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: "free", // livello base
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

console.log("✅ AuthClient caricato correttamente");
