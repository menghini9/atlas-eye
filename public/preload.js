(async () => {
  const url = "/cesium/Cesium.js";
  const cache = await caches.open("atlas-eye-cache");
  const match = await cache.match(url);
  if (!match) {
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res.clone());
  }
})();
