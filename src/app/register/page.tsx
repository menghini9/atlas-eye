"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/authClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Provider social
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();
  const appleProvider = new OAuthProvider("apple.com");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Le password non coincidono");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Registrazione completata con successo!");
      router.push("/");
    } catch (err: any) {
      console.error("Errore registrazione:", err);
      setError("Errore durante la registrazione: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any) => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      console.error("Errore social login:", err);
      alert("❌ Errore durante l'accesso social.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>Registrati ✨</h1>

      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "8px", marginBottom: "10px", width: "220px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px", marginBottom: "10px", width: "220px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Conferma Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{ padding: "8px", marginBottom: "15px", width: "220px" }}
        />
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#6b46c1",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          {loading ? "Attendere..." : "Crea account"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        <p>Oppure registrati con:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => handleSocialLogin(googleProvider)}
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
            onClick={() => handleSocialLogin(facebookProvider)}
            style={{
              background: "#4267B2",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Facebook
          </button>

          <button
            onClick={() => handleSocialLogin(appleProvider)}
            style={{
              background: "black",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Apple
          </button>
        </div>
      </div>

      <p style={{ marginTop: "25px" }}>
        Hai già un account?{" "}
        <a
          href="/login"
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          Accedi
        </a>
      </p>
    </div>
  );
}
