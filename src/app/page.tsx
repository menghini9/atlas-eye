"use client";

import { useEffect, useState } from "react";
import { auth } from "./lib/authClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./lib/firebaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Utente loggato:", currentUser.email);
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "prova"));
      setData(snapshot.docs.map((doc) => doc.data()));
    } catch (err) {
      console.error("Errore Firestore:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🌐 Atlas Eye</h1>

      {user ? (
        <>
          <p className="mb-2">Benvenuto, {user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded mb-4"
          >
            Logout
          </button>

          <h2 className="text-xl mb-2">Dati Firestore:</h2>
          <ul>
            {data.map((item, i) => (
              <li key={i} className="text-sm mb-1">
                {JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="mb-4">Effettua l'accesso per continuare</p>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Vai al Login
          </a>
        </>
      )}
    </main>
  );
}
