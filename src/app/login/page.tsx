// ⬇️ BLOCCO 3: LoginScreen (aggiornato definitivo)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/authClient"; // <--- percorso corretto

// ⬇️ BLOCCO 1: Import Firestore + App Firebase
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import app from "../lib/firebaseClient";
 // <--- percorso corretto per la tua app Firebase
// ⬆️ FINE BLOCCO 1


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const googleProvider = new GoogleAuthProvider();

  // 🔹 Login con email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/profile"); // <--- profile page coerente
    } catch (err: any) {
      console.error("Errore login email:", err);
      setError("Email o password errati");
    }
  };
// ⬇️ BLOCCO 2: Inizializza Firestore con la tua app
const db = getFirestore(app);
// ⬆️ FINE BLOCCO 2

  // 🔹 Login Google
// ⬇️ BLOCCO 3: handleGoogleLogin (versione debug Firestore)

const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 🧩 Import Firestore dal client già inizializzato
    const { db } = await import("../lib/firebaseClient");
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

    console.log("🧠 Tentativo di salvataggio utente su Firestore...");

    // 🔥 Scrive o aggiorna documento utente
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        role: "free",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ Utente salvato con successo:", user.email);
    alert("✅ Login con Google riuscito!");
    router.push("/profile");
  } catch (error) {
    console.error("❌ Errore durante il login con Google:", error);
    alert("Errore durante il login con Google. Controlla la console.");
  }
};
// ⬆️ FINE BLOCCO 3



  // 🔹 Accesso rapido per test (senza login)
  const handleGuestAccess = () => {
    console.log("🧪 Accesso test attivato");
    alert("⚠️ Accesso test attivo — login bypassato per debug");
    router.push("/profile"); // <--- navigazione interna senza reload
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Benvenuto su Atlas Eye 👁️</h1>

      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          width: "320px",
          textAlign: "center",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "15px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#6a1b9a",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Accedi
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>{error}</p>
        )}

        {/* 🔹 Social Login */}
        <div style={{ marginTop: "20px" }}>
          <p>Oppure accedi con:</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={handleGoogleLogin}
              type="button"
              style={{
                background: "#DB4437",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Google
            </button>

            <button
              onClick={() => alert("⚠️ Login con Facebook non ancora disponibile")}
              type="button"
              style={{
                background: "#4267B2",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              Facebook
            </button>

            <button
              onClick={() => alert("⚠️ Login con Apple non ancora disponibile")}
              type="button"
              style={{
                background: "black",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              Apple
            </button>
          </div>
        </div>

        {/* 🔹 Link Registrazione */}
        <p style={{ marginTop: "20px" }}>
          Non sei ancora registrato?{" "}
          <span
            onClick={() => router.push("/register")}
            style={{
              color: "#6a1b9a",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Registrati
          </span>
        </p>

     {/* ⬇️ BLOCCO 3.5: Accesso test aggiornato */}
<div style={{ marginTop: "20px", textAlign: "center" }}>
  <button
onClick={() => {
  console.log("🧪 Accesso test attivato");
  sessionStorage.setItem("guestAccess", "true"); // ✅ mantiene sessione test
  window.location.href = "/profile"; // ✅ reindirizza alla profile giusta
}}
    type="button"
    style={{
      backgroundColor: "#8a2be2",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
      boxShadow: "0 0 8px rgba(138, 43, 226, 0.5)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
    onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
  >
    🔍 Accedi come Test
  </button>
</div>
{/* ⬆️ FINE BLOCCO 3.5 */}

      </form>
    </div>
  );
}
// ⬆️ FINE BLOCCO 3
