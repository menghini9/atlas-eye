// scripts/copy-cesium.js
const fs = require("fs");
const path = require("path");

const src = path.join(process.cwd(), "node_modules/cesium/Build/Cesium");
const dest = path.join(process.cwd(), "public/cesium");

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

// copia ricorsiva
function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, entry.name);
    const dstPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
copyDir(src, dest);
console.log("✅ Copiati asset Cesium in /public/cesium");
