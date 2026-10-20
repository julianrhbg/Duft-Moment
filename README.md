# DAZWISCHEN · Duft Moment

Deutschsprachiges Duftquiz mit drei kurzen Fragen, einer Empfehlung und geschützter gemeinsamer Verwaltung. Keine Besucheranmeldung, laufende KI, Tracker oder externen Medienabrufe.

**Veröffentlicht:** https://duftmoment-julian.julian-rehberger.chatgpt.site — Adresse und bisheriger QR-Code bleiben erhalten.

## Aktueller Stand

- Sechs Sekunden Einstieg: „Drei Düfte.“ → „Ein Moment.“ → „DAZWISCHEN“. Quiz, Bestand und Startmotiv laden parallel. Antippen, Escape oder Tab überspringt ihn; reduzierte Bewegung startet unmittelbar. Kein erneutes Intro bei Home, Menü oder Quizantwort.
- Drei Duftgruppen, lokale Tageszeit, saisonale lokale Motive und Neustart ohne gespeicherte Besucherantworten.
- 23 Produkte und 22 redaktionelle Ausgangsrezepte einschließlich fünf Dreier-Kompositionen. Die tatsächliche Empfehlung berücksichtigt gemeinsame Einstellungen, Verfügbarkeit und Ausschlüsse.
- Dreier-Rezepte erhalten innerhalb vergleichbar passender, dosierbarer und noch ungesehener Kandidaten mehr Auswahlgewicht. Gute kleinere Rezepte und fertige Mischprodukte bleiben möglich. Zwei Gesamttropfen ergeben höchstens zwei Zutaten.
- Info-Demo mit scrollgesteuerter Glas-Komposition, Quellen, automatischem Hell-/Dunkelmodus und statischen Fallbacks. Demo-Code lädt erst beim Öffnen.

## Produktion und lokale Vorschau

Die veröffentlichte Seite verwendet **Cloudflare Worker + privates R2-Binding `BUCKET`**. `hosting/server.mjs` enthält den tatsächlichen Adapter. `.openai/hosting.json` verweist auf das bestehende Sites-Projekt. Keine Node-/SQLite-Umstellung und keine neuen Dienste nötig.

Lokale Voraussetzung: Node.js 24 und Python 3. Der Worker benötigt keine Laufzeitpakete.

```bash
npm run build
npm run dev:hosted
```

Vorschau auf Port 4173. Sie führt den gebauten Worker mit flüchtigem Testspeicher aus. Keine produktiven Daten oder Schlüssel werden geladen. Lokale QA-Routen erlauben Smartphone-, Schema- und Intro-Standbilder; sie gehören nicht zum Produktionsartefakt. Die Vorschau ist kein dauerhafter Verwaltungsserver.

Der bisherige Node-/SQLite-Adapter unter `src/server.mjs` bleibt als separate Variante erhalten. `npm start`, `npm run dev`, `npm run setup` und die optionalen alten Browserläufe betreffen diese Variante. Sie sind kein Veröffentlichungsweg für die bestehende Seite. Details: [historische Node-Referenz](docs/node-reference.md).

## Verwaltung und Bestand

Alle produktiven Einstellungen, Passwort- und Sitzungshashes bleiben in R2. GitHub enthält Quellcode und redaktionelle Standards. Serverseitige Sitzungen, Herkunftsprüfung, Anmeldelimits und bedingte Schreibvorgänge bleiben erhalten. Kein Zurücksetzen des Zugangs und keine produktiven Speicherexporte in Git.

Die additive Dreier-Migration ergänzt fehlende IDs einmalig. Eigene Rezepte, Prioritäten, Sperren, Leer-Markierungen, Texte und Gerätegrenzen bleiben maßgeblich. Stufen 2/3/4 und Vier-Tropfen-Deckel sind bestehende interne Regeln, keine Herstellerhöchstwerte oder Sicherheitsgarantie. Ohne dokumentierte Produkt-/Gerätegrundlage werden weiterhin Verhältnisse gezeigt.

## Prüfen und bauen

```bash
npm run check
npm test
npm run test:intro
npm run build
npm run test:hosting
npm run test:migration
npm run test:info-ui
npm run test:renderer
npm run validate
```

Tests prüfen Auswahl, Dosierung, Rotation, Grenzen, Intro-Lebenszyklus, API-/Zugriffsschutz, Migration, Quelltreue, Info-Zustand und Renderer-Testdoubles. Historische Node-Tests nutzen temporäre Speicher. Testdoubles ersetzen keine visuelle Browserprüfung.

Artefakt: `dist/server/index.js` und `dist/.openai/hosting.json`. Veröffentlichung über den autorisierten Sites-Weg im bestehenden Projekt. Ein GitHub-Push veröffentlicht hier nicht automatisch. [Hosting-Übergabe](docs/hosting-handoff.md) · [Abgleich und tatsächlich ausgeführte Prüfungen](docs/sync-status.md).

## Quellen und Medien

[Quellenbasis](research/notes.md), [frühere Recherche](research/legacy-notes.md), [Dreier-Rezepte](research/trios.md), [Mediennachweise](public/assets/credits.json). Die Produktquellen und Freigaben der bestehenden Installation liegen zusätzlich in der gemeinsamen Konfiguration. Rezepte beschreiben Duftatmosphären, keine nachgewiesenen Gesundheitswirkungen. Keine offizielle Partnerschaft mit doTERRA oder Stadler Form.
