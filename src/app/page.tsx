// ⬇️ BLOCCO 1 — Redirect iniziale (modificato per Atlas Eye)
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/profile"); // ✅ Reindirizza alla pagina profilo
  }, [router]);

  return null; // ✅ Nessun contenuto visibile
}
// ⬆️ FINE BLOCCO 1
