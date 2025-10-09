# 🔵 CHECKLIST SVILUPPO – ATLAS EYE

---

## 🧰 FASE 0 – Documentazione e manutenzione repo (🟡 In corso)
- ✅ Creazione e configurazione `README.md` (istruzioni installazione, build, deploy)
- ✅ Inizializzazione `CHANGELOG.md` (storico versioni)
- ✅ Creazione file `ATLAS_EYE_CHECKLIST.md` (nel repo principale)
- 🟡 Aggiornamento README con istruzioni Firebase e `.env`
- ⏳ Aggiunta documentazione per middleware, auth e deploy automatico
- ⏳ Verifica licenze dipendenze e note legali (OSS compliance)

---

## 🧠 FASE 1 – Impostazione tecnica (✅ Completata)
- ✅ Creazione progetto Next.js / TypeScript
- ✅ Configurazione repo GitHub + collegamento a Vercel
- ✅ Configurazione ambiente locale VS Code (HP + sincronizzazione Git)
- ✅ Deploy iniziale su Vercel funzionante
- ✅ Integrazione Firebase App (auth e API key)
- ✅ Collegamento e test `authClient.ts` / `firebaseClient.ts`
- ✅ Implementazione login, register e logout funzionanti
- ✅ Sincronizzazione Git ↔ Vercel automatica
- ✅ Installazione TypeScript e tipi React
- ✅ Script `npm run deploy` (auto commit + push + build Vercel)
- 🟡 Creazione file `.env.local` con chiavi Firebase e future API

---

## 🔐 FASE 2 – Sicurezza e autenticazione (🟡 In corso)
- ✅ Accesso email/password funzionante
- ✅ Collegamento provider Google in Firebase
- 🟡 Bottoni social (Google attivo, Facebook/Apple disattivati)
- ✅ Middleware di autenticazione (Firebase cookie + modalità dev test)
- 🟡 Refresh token + sessione persistente
- 🟡 Redirect automatico utenti loggati → `/home`
- ⏳ Gestione ruoli `free / pro / admin`
- ⏳ Limitazione accesso a route protette per ruolo
- ⏳ Logging degli accessi e monitoraggio anomalie

---

## 🎨 FASE 3 – UI / UX e design system (🟡 In corso)
- ✅ Login e Register page base funzionanti
- 🟡 Miglioramento estetico (layout responsivo, palette coerente)
- ⏳ Pulsanti “Torna alla home” / “Accedi come ospite”
- 🟡 Configurazione Tailwind CSS e `postcss.config.mjs`
- ⏳ Creazione design system (brand colors, tipografia, componenti)
- ⏳ Implementazione navbar / sidebar / card component
- ⏳ Responsive design mobile (Galaxy S22 + desktop)
- ⏳ Animazioni transizioni (Framer Motion / React Spring)
- ⏳ Tema scuro / chiaro toggle

---

## ⚙️ FASE 4 – Contenuto e funzionalità (⏳ Da fare)
- ⏳ Creazione dashboard utente (base / premium)
- ⏳ Gestione ruoli collegata al database (Free / Pro / Admin)
- ⏳ Collegamento Firebase Storage (upload immagini e file)
- ⏳ Collegamento Firestore Database (salvataggio utenti / feed)
- ⏳ Trigger e regole di sicurezza Firestore
- ⏳ Sistema preferenze utente (stato globale Zustand/Context)
- ⏳ API notizie esterne (NewsAPI, GDELT, custom feed)
- ⏳ Integrazione mappa interattiva (Mapbox / Leaflet)
- ⏳ Filtri ricerca e categorie (geopolitica, regioni, temi)
- ⏳ Dashboard “Feed Atlas Eye” con widget modulari

---

## 🌍 FASE 5 – Deploy e testing finale (⏳ Da fare)
- ⏳ Revisione ambiente Vercel (env, domini custom)
- ⏳ Testing autenticazione (email, social, ospite)
- ⏳ Test middleware in produzione
- ⏳ Correzione bug cross-browser (Chrome, Edge, Safari, mobile)
- ⏳ Implementazione analytics (Firebase + Vercel + Google)
- ⏳ Deploy pubblico finale (versione MVP)
- ⏳ Test prestazioni Lighthouse / Core Web Vitals
- ⏳ Configurazione monitoraggio errori (Sentry / LogRocket)

---

## 🧩 FASE 6 – Brand, grafica e comunicazione (🟡 In corso)
- ✅ Definizione brand Atlas Eye
- 🟡 Studio logo e palette colori
- ⏳ Creazione grafica interfaccia coerente con brand
- ⏳ Ottimizzazione SEO (meta, immagini, titoli, Open Graph)
- ⏳ Preparazione contenuti testuali e visivi (landing, presentazione)
- ⏳ Pagine legali (Terms, Privacy, Cookie)
- ⏳ Dominio personalizzato e branding finale

---

## 🔒 FASE 7 – Sicurezza, privacy e ottimizzazione (⏳ Da fare)
- ⏳ Configurazione HTTPS e regole CORS
- ⏳ Policy cookie e privacy (GDPR compliance)
- ⏳ Controllo accessi ruoli e limiti API
- ⏳ Backup automatico Firebase / GitHub (weekly cron)
- ⏳ Monitoraggio risorse e costi (Google Cloud / Vercel)
- ⏳ Controllo dipendenze vulnerabili (`npm audit`)
- ⏳ Ottimizzazione immagini e bundle JS
- ⏳ Cache policy / service worker (PWA future)

---

## 🧭 FASE 8 – Estensioni future (⚪ Pianificata)
- ⚪ App mobile nativa (Android Studio + Kotlin)
- ⚪ Sistema notifiche push / aggiornamenti live
- ⚪ Modalità “Pro” con pagamenti (Stripe / PayPal)
- ⚪ Dashboard amministratore
- ⚪ Integrazione AI (analisi geopolitica automatica)
- ⚪ Internazionalizzazione (i18n)
- ⚪ Modalità offline e PWA

---

## 📋 Legenda stato
✅ **Completato** 🟡 **In corso** ⏳ **Da fare** ⚪ **Pianificato**
