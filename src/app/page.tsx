"use client";

import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebaseClient";

export default function HomePage() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "prova"));
        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
        });
      } catch (error) {
        console.error("Errore Firebase:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      <h1>Atlas Eye</h1>
      <p>Connessione Firebase attiva ✅</p>
    </main>
  );
}
