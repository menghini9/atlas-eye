"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/authClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        console.log("✅ Utente loggato:", firebaseUser.email);
      } else {
        console.log("❌ Nessun utente loggato, reindirizzo al login");
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logout effettuato");
    router.push("/login");
  };

  if (loading) return <p>Caricamento...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {user ? (
        <>
          <h1>Benvenuto 👁️ Atlas Eye</h1>
          <p>Email: {user.email}</p>
          <p>UID: {user.uid}</p>
          <p>Ruolo: free</p>
          <button
            onClick={handleLogout}
            style={{
              background: "#ff4747",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Esci
          </button>
        </>
      ) : (
        <p>Nessun utente connesso</p>
      )}
    </div>
  );
}
