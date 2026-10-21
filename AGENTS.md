# Duft Moment / DAZWISCHEN

## Produktion erhalten

Die bestehende öffentliche Installation läuft unter https://duftmoment-julian.julian-rehberger.chatgpt.site als Cloudflare-Worker mit dem privaten R2-Binding `BUCKET`. `.openai/hosting.json` enthält das bestehende Sites-Projekt. Adresse, Zugriffskreis, Binding und Verwaltungszugang erhalten. Kein neues Projekt anlegen, keine Umstellung auf Node/SQLite.

- `public/`: tatsächlich veröffentlichte Oberfläche, Intro und lokale Auswahlregel.
- `src/catalog.mjs`: redaktionelle Ausgangsdaten und Dreier-Rezepte.
- `hosting/server.mjs`: produktive API, Authentifizierung und R2-Persistenz.
- `hosting/legacy-defaults.json`: historische öffentliche Standardinhalte für die bestehende Migration; keine produktiven Einstellungen.
- `scripts/assemble-hosted.py`: baut `worker/index.js`; generierte Datei nicht direkt bearbeiten.
- `src/server.mjs`: erhaltener separater Node-/SQLite-Adapter; nicht die Produktionsanbindung.

## Lokale Arbeit

`npm run build`, dann `npm run dev:hosted` für die Vorschau des tatsächlichen Workers. Ihr Speicher ist flüchtig und vollständig getrennt von R2. `npm start`/`npm run dev` betreffen die separate historische Node-Variante.

Die R2-Konfiguration ist maßgeblich. Keine Passwörter, Sitzungen, Einrichtungsschlüssel oder privaten Speicherexporte in Git. Keine Zugänge zurücksetzen, keine vorhandenen Markierungen oder eigenen Rezepte überschreiben. Migrationen nur gezielt, versioniert und idempotent. Der aktuelle Dreier-Zusatz ist mit `trioLibraryVersion: 1` markiert.

Sechs Sekunden Intro, drei lesbare Textmomente. Quiz und Konfiguration laden unabhängig. Überspringen, reduzierte Bewegung, Home und BFCache erhalten. Der Info-Button öffnet ausschließlich Anwendungshinweise und Quellen. Die Demo-Dateien bleiben erhalten, aber ohne sichtbaren Einstieg und ohne Import aus dem normalen Quiz. Die Demo nicht ungefragt erneut freischalten. Keine Besucherantworten dauerhaft speichern. Aktuelle Gesamt- und Einzelölgrenzen nicht erhöhen.

## Prüfung und Übergabe

Passend zur Änderung: `npm run check`, `npm test`, `npm run test:intro`, `npm run build`, `npm run test:hosting`, `npm run test:migration`, `npm run test:info-ui`, `npm run test:renderer`, `npm run validate`. Testdoubles nicht als visuelle Browserabnahme ausgeben.

Artefakt: `dist/server/index.js` und `dist/.openai/hosting.json`. Nur über den autorisierten Sites-Weg im bestehenden Projekt veröffentlichen. Ein GitHub-Commit allein veröffentlicht nicht. Ohne Hostingzugriff den geprüften Commit zur Übernahme bereitstellen und die ausstehende Veröffentlichung nennen. Keine Ersatzadresse ausgeben.

GitHub und Hosting ausdrücklich abgleichen. Letzter importierter Hostingquellstand: `docs/sync-status.md`. Vor erneutem Abgleich immer den aktuellen Stand lesen.
