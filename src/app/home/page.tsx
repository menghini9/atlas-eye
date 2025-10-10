"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/authClient";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #6a1b9a, #8a2be2)",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        👁️ Caricamento in corso...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6a1b9a, #8a2be2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
          🏠 Benvenuto su <span style={{ color: "#FFD700" }}>Atlas Eye</span>
        </h1>

        {user && (
          <>
            <p style={{ margin: "10px 0" }}>👤 {user.email}</p>
            <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              UID: {user.uid}
            </p>
            <p style={{ fontSize: "1rem", marginTop: "8px" }}>
              Ruolo: <strong>free</strong>
            </p>
          </>
        )}

        <div style={{ marginTop: "25px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ff5252",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.3s ease-in-out",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff1744")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff5252")
            }
          >
            🔓 Esci
          </button>

          <button
            onClick={() => router.push("/login")}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.3s ease-in-out",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.35)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
            }
          >
            ↩️ Torna al Login
          </button>
        </div>
      </div>
    </div>
  );
}
