// ⬇️ BLOCCO 5.1 — ProfilePage (pagina profilo + collegamento mappa)
"use client";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/authClient"; // <--- percorso corretto
import { useEffect, useState } from "react";

// 🌌 ProfilePage base – Atlas Eye
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const goToMap = () => {
    router.push("/map");
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #001f3f 0%, #004080 60%, #0074D9 100%)",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        👤 Profilo Atlas Eye
      </h1>

      {user ? (
        <>
          <p>Email: {user.email}</p>
          <p>UID: {user.uid}</p>
          <p>Livello: Free Explorer 🌍</p>

          <button
            onClick={goToMap}
            style={{
              marginTop: "30px",
              padding: "12px 24px",
              backgroundColor: "#00aaff",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            🌎 Vai alla Mappa
          </button>

          <button
            onClick={handleLogout}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#ff4444",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            🚪 Esci
          </button>
        </>
      ) : (
        <p>Caricamento profilo...</p>
      )}
    </div>
  );
}
// ⬆️ FINE BLOCCO 5.1
