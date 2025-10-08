// ⬇️ BLOCCO 4: HomePage base (Atlas Eye)
"use client";
import { useRouter } from "next/navigation";
import { auth } from "../lib/authClient";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    console.log("🚪 Logout eseguito");
    router.push("/"); // Torna alla login
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6a1b9a, #8e24aa)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1>🏠 Benvenuto su Atlas Eye Home</h1>
      <p style={{ marginTop: "10px" }}>
        Accesso riuscito — sei nella home!
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          backgroundColor: "#fff",
          color: "#6a1b9a",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 0 8px rgba(255,255,255,0.3)",
          transition: "0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Esci
      </button>
    </div>
  );
}
// ⬆️ FINE BLOCCO 4
