// ⬇️ BLOCCO 10.1 — Copia asset Cesium correttamente per Vercel
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Percorso sorgente (dove Cesium installa i suoi asset)
const cesiumSource = path.join(__dirname, "../node_modules/cesium/Build/Cesium");

// Percorso destinazione (cartella pubblica del progetto)
const cesiumDest = path.join(__dirname, "../public/cesium");

// Copia i file statici
async function copyCesiumAssets() {
  try {
    await fs.ensureDir(cesiumDest);
    await fs.copy(cesiumSource, cesiumDest, { overwrite: true });
    console.log("✅ Asset Cesium copiati correttamente in /public/cesium");
  } catch (err) {
    console.error("❌ Errore copia asset Cesium:", err);
  }
}

copyCesiumAssets();
// ⬆️ FINE BLOCCO 10.1
