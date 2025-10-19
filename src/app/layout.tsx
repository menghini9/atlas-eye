// ⬇️ BLOCCO 10.6 — Layout globale con Cesium CSS
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  description: "Advanced 3D Earth visualization platform powered by Cesium and Mapbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* ✅ Import del CSS di Cesium come asset statico */}
        <link rel="stylesheet" href="/cesium/Widgets/widgets.css" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, overflow: "hidden" }}
      >
        {children}
      </body>
    </html>
  );
}
// ⬆️ FINE BLOCCO 10.6
