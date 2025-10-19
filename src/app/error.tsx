"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Errore globale:", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #000010, #220000)",
          color: "white",
        }}
      >
        <h1>Qualcosa è andato storto</h1>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            background: "gold",
            color: "black",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Riprova
        </button>
      </body>
    </html>
  );
}
