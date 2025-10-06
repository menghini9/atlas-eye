// ⬇️ BLOCCO 3: LoginScreen (aggiornato)
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const googleProvider = new GoogleAuthProvider();

  // Login classico con email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError("Email o password errati");
    }
  };

  // Login Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      console.error("Errore login Google:", err);
      alert("Errore durante il login con Google");
    }
  };

  // Accesso rapido per test (senza login)
  const handleGuestAccess = () => {
    alert("⚠️ Accesso ospite attivo solo per test — non vengono salvati dati utente");
    router.push("/");
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

        {/* Social Login */}
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

        {/* Link a Registrazione */}
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

        {/* Accesso ospite */}
        <p style={{ marginTop: "10px" }}>
          <span
            onClick={handleGuestAccess}
            style={{
              color: "gray",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Entra come ospite (solo test)
          </span>
        </p>
      </form>
    </div>
  );
}
// ⬆️ FINE BLOCCO 3
