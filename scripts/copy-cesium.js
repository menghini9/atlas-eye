// ⬇️ BLOCCO 7.1 — Copia automatica asset Cesium (compatibile Windows + Vercel)
import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// 📦 Sorgente: build Cesium installata in node_modules
const src = path.join(process.cwd(), "node_modules/cesium/Build/Cesium");
// 🎯 Destinazione: cartella pubblica accessibile da Next
const dest = path.join(process.cwd(), "public/cesium");

// 🧹 Elimina vecchia cartella (se esiste)
if (fs.existsSync(dest)) {
  try {
    fs.rmSync(dest, { recursive: true, force: true });
  } catch (err) {
    console.warn("⚠️ Impossibile rimuovere /public/cesium:", err.message);
  }
}

// 📁 Ricrea la directory di destinazione
fs.mkdirSync(dest, { recursive: true });

// 🔄 Copia ricorsiva dei file Cesium
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, entry.name);
    const dstPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      copyDir(srcPath, dstPath);
    } else {
      try {
        fs.copyFileSync(srcPath, dstPath);
      } catch (err) {
        console.warn(`⚠️ Errore copiando ${entry.name}:`, err.message);
      }
    }
  }
}

copyDir(src, dest);
console.log("✅ Asset Cesium copiati correttamente in /public/cesium");
// ⬆️ FINE BLOCCO 7.1
