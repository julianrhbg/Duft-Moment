# Bestehendes Sites-Hosting erhalten

Produktionsadresse: https://duftmoment-julian.julian-rehberger.chatgpt.site

Der tatsächliche Adapter ist enthalten: `hosting/server.mjs`, `scripts/assemble-hosted.py`, `hosting/legacy-defaults.json` und `.openai/hosting.json`. Der Projektbezug ist kein Geheimnis. Zugangsdaten und R2-Zustand gehören nicht ins Repository.

`public/`, `public/engine.mjs`, `public/validate.mjs` und `src/catalog.mjs` sind die gemeinsame Quelle. Der Assembler erstellt `worker/index.js`; `npm run build` legt das Worker-ESM unter `dist/server/index.js` mit `dist/.openai/hosting.json` bereit. Keine Node-/SQLite-Laufzeit im veröffentlichten Artefakt. Der separate Node-Server ist keine Produktionsalternative für diese Adresse.

## Speicher und Zugriff

Die vorhandene R2-Bindung `BUCKET` und private Datei `duftmoment-state.json` bleiben unverändert. Passwortableitung, Sitzungscookie, Ablauf, Anmeldelimits und Herkunftsprüfung übernimmt der vorhandene Adapter. Keine Ersteinrichtung erneut öffnen und keine Secrets ersetzen. Export/Import betrifft Inhalte, nicht Zugangsdaten.

Die produktiven Einstellungen sind maßgeblich. Die bereits veröffentlichte Dreier-Ergänzung wird über `trioLibraryVersion: 1` erkannt. Wiederholte Builds setzen keine individuellen Rezepte oder Ölmarkierungen zurück. `hosting/legacy-defaults.json` ist eine historische öffentliche Ausgangsbasis, kein R2-Backup und keine Aufforderung zum Reset.

## Neue Änderungen übernehmen

1. GitHub und aktuellen Hostingquellstand vergleichen; parallele Änderungen gezielt zusammenführen.
2. Relevante Tests aus der README ausführen. Worker bauen und Artefakt validieren.
3. Über den autorisierten Sites-Quellworkflow das **bestehende** Projekt aus `.openai/hosting.json` aktualisieren, den exakten Quellcommit speichern und dessen Artefakt veröffentlichen.
4. Deploymentstatus und echte URL prüfen. Bei Oberflächenänderungen öffentlichen Konfigurationsstand vor/nachher vergleichen. Keine produktiven Passwörter oder Sitzungen auslesen.

Ohne Sites-Zugriff endet die Arbeit mit einem geprüften GitHub-Commit und ausdrücklich ausstehender Veröffentlichung. Ein GitHub-Commit oder `npm start` veröffentlicht nicht unter der bisherigen Adresse. Keine Ersatzadresse oder neue Infrastruktur einführen.
