// ⬇️ BLOCCO TEST: Verifica sessione utente
"use client";

import { useAuthUser } from "./lib/authClient";

export default function Home() {
  const { user, loading } = useAuthUser();

  if (loading) return <p>Caricamento sessione...</p>;
  if (!user) return <p>Nessun utente connesso</p>;

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
      <h2>✅ Bentornato, {user.email}</h2>
      <p>Ruolo: {user.role}</p>
    </div>
  );
}
// ⬆️ FINE BLOCCO TEST
