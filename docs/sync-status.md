# Abgleich · 20.10.2026

GitHub-Ausgangspunkt: `86f60b646f4f889313c9b610318a406b7e251911`.

Übernommener veröffentlichter Sites-Quellstand: `cf27f9e4407ab47f212bd69bbc6978fe955ee93b`, veröffentlichte Version 10 unter https://duftmoment-julian.julian-rehberger.chatgpt.site.

## Umfang

Das gemeinsame Frontend wird von `upstream/public/` im Hostingcheckout nach `public/` in GitHub übertragen, Katalog und Tests entsprechend nach `src/` und `test/`. Der produktive Adapter wird unter `hosting/` ergänzt. Seine Buildskripte und Tests erhalten ausschließlich die zur flachen Repositorystruktur passenden Dateipfade. Der generierte Worker muss danach bytegleich zum veröffentlichten Quellstand sein.

Neuere GitHub-Demo-Dateien, deren Dokumentation und vorhandene Screenshots bleiben erhalten. Bereits passende Assets und Node-Serverdateien werden nicht überschrieben. Die bisherige Node-README ist als historische Referenz gesichert; aktuelle Betriebsangaben stehen in README und AGENTS.md.

Keine produktiven R2-Daten, Passwörter, Sitzungen oder Einrichtungsschlüssel werden übernommen. Alle produktiven Einstellungen bleiben im bestehenden Speicher. Keine neue Migration und keine erneute Veröffentlichung, da der laufende Worker unverändert bleibt.

## Prüfungen

Ausgeführt im abgeglichenen Repositoryaufbau:

- `npm run check`: 27 JavaScript-Dateien, Schema, 23 Produkte und 24 lokale Landschaftsmotive.
- `npm test`: 29 Fach-/Server-/Rezepttests bestanden.
- `npm run test:intro`: fünf Tests bestanden, einschließlich 6000 ms, Überspringen, reduzierter Bewegung und BFCache-Aufräumen.
- `npm run build` und `npm run validate`: Worker-ESM gebaut und validiert.
- `npm run test:hosting`, `npm run test:migration`, `npm run test:info-ui`, `npm run test:renderer`: bestanden. Die Info-/Rendererprüfungen verwenden Testdoubles, keine neue visuelle Browserabnahme.
- `cmp worker/index.js <veröffentlichter Quellstand>/worker/index.js`: bytegleich. Hostingadapter, Manifest, gemeinsame Frontenddateien und Katalog wurden ebenfalls abgeglichen.

`worker/` und `dist/` sind reproduzierbare, Git-ignorierte Buildausgaben. Die Quellen bilden denselben Worker ohne duplizierten `upstream/`-Baum.

Die visuelle Smartphone- und Klickprüfung der unveränderten Oberfläche erfolgte bereits vor der Veröffentlichung von Version 10. In diesem reinen Repositoryabgleich wurde sie nicht erneut ausgeführt.
