# Zweitprüfung der adaptiven Auswahl – 15. November 2026

## Korrigiert
- Zurück aus der ersten Zusatzfrage führt wieder zur Duftstärke.
- Browser-Zurück und -Vorwärts stellen Antworten, Zusatzfragen und Ergebnisse innerhalb des laufenden Besuchs wieder her.
- Home verwirft auch die Zusatzfragenhistorie.
- Bergamot Mint wird entsprechend dem vorhandenen Katalog als weich-krautig eingeordnet, nicht pauschal als Minze/Eukalyptus.
- Gleiche Zusammensetzungen unter verschiedenen Namen lösen allein keine Zusatzfrage aus. Auswahlmöglichkeiten müssen die Rezeptmenge einschränken.
- Ungültige Auswahlwerte werden abgewiesen. Ungenutzte Zufalls- und Rotationszustände wurden aus der Besucheroberfläche entfernt.

## Tatsächlich geprüft
- 40 Node-Tests erfolgreich.
- Oberflächentests für regulären und frühen Start erfolgreich, einschließlich Zurück, Browserhistorie, Home und Info.
- Hostingtests für API, Zugriffsschutz, Sitzungen, Speicherung, Dosierung und Ausschlüsse erfolgreich.
- Bestandsmigration auf Einmaligkeit, Erhalt eigener Einstellungen und Parallelzugriffe geprüft.
- Build und Artefaktvalidierung erfolgreich.
- Im echten Browser bei 390 px Breite: Lernen → deutlich → Zurück → deutlich → frisch → Kräuter → Ergebnis. Screenshot: quiz-review.jpg.

## Grenzen
Die Auswertung von 1.116 Antwortpfaden über sieben Tätigkeiten, drei Stärken und vier Uhrzeiten verwendet Repository-Standarddaten, nicht den persönlichen Live-Bestand. Dabei werden 19 von 31 Rezepten und 16 von 27 Produkten zur Erstempfehlung. Nicht jede vorhandene Flasche hat damit bereits einen eigenen sinnvollen Erstempfehlungspfad. Keine Zufallsrotation oder erzwungene Zutat wurde ergänzt, um diese Grenze zu kaschieren.

Die Auswahl bleibt eine redaktionelle Rezeptbibliothek mit festen Regeln. Sie ist kein wissenschaftlicher Nachweis einer optimalen Mischung oder einer Wirkung auf Lernen, Schlaf oder Gesundheit. Diese Prüfung ersetzt keine erneute vollständige Produktrecherche.

Hostingadapter, Speicherbindung, Authentifizierung und vorhandene persönliche Einstellungen wurden nicht geändert. Kein Redesign und keine Datenmigration hinzugefügt.
