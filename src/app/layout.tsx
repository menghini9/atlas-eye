// ⬇️ BLOCCO 10.7 — Layout globale ottimizzato (Overlay + Cesium + Preload)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas Eye",
  description:
    "Advanced 3D Earth visualization platform powered by Cesium and Mapbox — hybrid view, real-time lights, and global navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* ✅ Import CSS Cesium */}
        <link rel="stylesheet" href="/cesium/Widgets/widgets.css" />

        {/* ✅ Preload Mapbox & Cesium per ridurre lag in transizione */}
        <link rel="preload" href="/cesium/Cesium.js" as="script" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />

        {/* ✅ Meta viewport ottimizzato per mobile */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          backgroundColor: "black",
        }}
      >
        {/* 🌍 Contenuto dinamico (ProfilePage, MapPage, ecc.) */}
        {children}

        {/* 🟢 Overlay globale di caricamento per transizioni tra pagine */}
        <div
          id="global-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(10,10,20,0.85) 0%, rgba(0,0,0,0.95) 100%)",
            color: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            fontFamily: "system-ui, sans-serif",
            fontSize: "1.1rem",
            letterSpacing: "0.05em",
          }}
        >
          Loading Atlas Eye...
        </div>

        {/* 🧠 Script di gestione overlay e sicurezza caricamento */}
        <Script id="global-overlay-script" strategy="afterInteractive">
          {`
            window.AtlasOverlay = {
              show: (msg = "Loading...") => {
                const el = document.getElementById("global-overlay");
                if (!el) return;
                el.textContent = msg;
                el.style.display = "flex";
                el.style.opacity = "0";
                requestAnimationFrame(() => {
                  el.style.transition = "opacity 0.25s ease";
                  el.style.opacity = "1";
                });
              },
              hide: () => {
                const el = document.getElementById("global-overlay");
                if (!el) return;
                el.style.transition = "opacity 0.25s ease";
                el.style.opacity = "0";
                setTimeout(() => (el.style.display = "none"), 250);
              },
            };
          `}
        </Script>
      </body>
    </html>
  );
}
// ⬆️ FINE BLOCCO 10.7
