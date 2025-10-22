// ⬇️ BLOCCO DICHIARAZIONE — Tipi globali Atlas Eye

declare global {
  interface Window {
    AtlasOverlay?: {
      show: (message?: string) => void;
      hide: () => void;
    };
  }
}

// Questa riga serve per farlo riconoscere come modulo globale
export {};
