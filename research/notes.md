# Quellen, Produktstatus und Grenzen

Stand: 18. Oktober 2026. Diese Notiz unterscheidet Angaben des Projektbriefs von tatsächlich gelesenen Quellen.

## Tatsächlich zugänglicher Ausgangsbestand

Das GitHub-Repository `julianrhbg/Duft-Moment` hatte keine Commits, keine Quelldateien, Medien oder Recherchen. Die im Projektbrief beschriebenen Cloudflare-/R2-Dateien und `assets/credits.json` waren nicht vorhanden. Auch gemeinsame Bestandsdaten und bestehende Zugangsdaten sind nicht zugänglich. Es erfolgte **keine Migration der veröffentlichten Installation** und keine Veränderung ihrer Zugangsdaten oder Adresse.

Die öffentliche Referenz, Lucy-Anleitung, doTERRA-EU-Übersicht, BfR-Seite und ANSES-Publikation wurden per HTTPS angefragt. Alle Anfragen scheiterten am Netzwerkproxy mit `Tunnel connection failed: 403 Forbidden`. Es wurde keine TLS-Prüfung deaktiviert. Die benötigten Domains sind im Umgebungsentwurf ergänzt; das allein hat die laufende Netzwerkfreigabe nicht geändert.

## Herkunft der Daten

- Die 23 Produkte einschließlich Aktivierung stammen aus dem übermittelten Projektbrief. Keine zusätzlichen Öle sind als vorhanden deklariert.
- Die Variante „Ölfläschchen“ ist eine **Bestandsangabe**, keine unabhängig überprüfte Produktfreigabe.
- Die Duftprofile sind knappe redaktionelle Beschreibungen. Keine wissenschaftliche Wirkungsbewertung und keine bestätigte vollständige Zusammensetzung.
- Bergamot Mint wird getrennt von Peppermint behandelt.
- Serenity, Air, Adaptiv, ZenGest, MetaPWR, Citrus Bliss, Balance und Abode sind als fertige Mischprodukte markiert. Konkrete EU-Zusammensetzung, mögliche regionale Abweichungen und Diffusereignung bleiben für jedes Produkt zu prüfen. Allein der Handelsname bestätigt keine Variante. Insbesondere bei MetaPWR, ZenGest und Abode müssen gleichnamige Nahrungsergänzungen bzw. Reinigungsprodukte ausgeschlossen werden.
- Nicht jedes vorhandene Öl wird in einem Rezept verwendet. Insbesondere kräftige Kräuterprodukte werden nicht bloß für mehr Abwechslung eingesetzt.
- Die 17 Rezepte sind eigene redaktionelle Duftideen, keine originalen doTERRA-Rezepte und keine klinisch geprüften Mischungen.

## Keine bestätigte Dosierung

Lucy schwarz, 50 ml Tank und 2–3 Tropfen zum Einstieg stammen ausschließlich aus dem Projektbrief. Die Anleitung konnte hier nicht gelesen werden. Eine numerische Herstellerhöchstmenge ist nicht belegt.

Die Werte 2 / 3 / 4 für die drei Intensitäten sowie maximal 4 Gesamttropfen sind deshalb **nur inaktive interne Ausgangsregeln**. Im öffentlichen Ergebnis erscheinen zunächst ausschließlich Mischungsverhältnisse. Ein Teil bedeutet ausdrücklich nicht ein Tropfen. Die Intensitätswahl wird bis zur Freigabe nicht als angewendete Dosierung ausgegeben.

Tropfen werden erst berechnet, wenn das Gerät und **alle** beteiligten Produkte in der Verwaltung mit HTTPS-Quelle und Prüfdatum dokumentiert auf „geprüft“ gesetzt wurden. Das Datum bestätigt eine Erklärung der Verwaltung, keine unabhängige automatische Prüfung des Quelleninhalts. Mengen werden als ganze positive Zahlen gesucht, bei maximal vier Ölen, korrekter Gesamtsumme und Einzelgrenzen. Bei Produkten mit der konservativen Einzelgrenze 1 wird der Rezeptanteil durch Rundung nicht erhöht. Nicht dosierbare geprüfte Rezepte werden ausgeschlossen. Wassermenge skaliert keine Rezeptmengen.

## Erforderliche fachliche Nachprüfung

1. Tatsächliches Etikett und konkrete EU-Ölvariante jedes verwendeten Produkts prüfen; Quelle, Prüfdatum, Zusammensetzung und Abweichungen dokumentieren.
2. Vorgesehene Diffuseranwendung separat prüfen. Haut- oder Einnahmeangaben sind keine Diffuserdosierung.
3. Lucy-Anleitung tatsächlich lesen; Gerät, Wasser/MAX, Einstiegsmenge und interne Rezeptgrenzen abgrenzen.
4. Risikohinweise aus den unabhängigen Quellen prüfen, insbesondere empfindliche Personen und Tiere. Kein allgemeines Sicherheitsversprechen ableiten.
5. Erst danach passende Freigaben und gegebenenfalls zurückhaltende Grenzen in der Verwaltung speichern.

## Ausgangsquellen — nicht als gelesen ausgeben

- [Lucy EU-Anleitung](https://www.stadlerform.com/media/c1/ce/72/1712837620/stadler-form-lucy-manual-eu.pdf)
- [Lucy Produktseite](https://www.stadlerform.com/de-de/aroma-diffuser/lucy-weiss-l-037)
- [doTERRA EU-Produktübersicht](https://media.doterra.com/eu/de/brochures/product-guide.pdf)
- [BfR: Ätherische Öle](https://www.bfr.bund.de/fragen-und-antworten/thema/aetherische-oele-duftende-wirkungen-mit-einschraenkungen/)
- [ANSES: Vigil’Anses, Juli 2020](https://vigilanses.anses.fr/sites/default/files/VigilAnsesN11_July2020_Spray.pdf)

## Medien

24 eigens erstellte lokale SVG-Landschaften: vier Jahreszeiten, drei Tagesphasen und je zwei Motive. Tageswechsel nach lokalem Kalenderdatum. Das sind bewusst Illustrationen, keine Fotografien und keine aktuellen Wetterdaten. Tagesphase und Jahreszeit folgen dem Gerät bzw. bewusst manuell eingestellter Uhrzeit. Ein statischer warmer Dunst ist Teil der Illustration; keine Behauptung einer echten Diffuseraufnahme. Die früher beschriebenen Videos sind nicht zugänglich. Deshalb keine fremde Ersatzaufnahme oder laufende Medienanfrage. Nachweise: `public/assets/credits.json`; reproduzierbare Zeichnungen: `scripts/landscapes.py`.

## Name und Gestaltung

Der aktuelle Auftrag verlangt ausdrücklich einen neuen, durchdachten Namen und hat Vorrang vor der alten Namensvorgabe. **DAZWISCHEN** bezeichnet den kleinen Übergang zwischen Tätigkeiten. Die ursprüngliche Fenstergestaltung wurde anschließend durch einen ruhigen Lichtkörper und einen unmittelbaren Einstieg in die Tätigkeitsfrage ersetzt. Saisonale lokale Motive, neutrale Materialtöne und eine klare serifenlose Hierarchie tragen die reduzierte Oberfläche. Siehe `docs/design.md`. Keine Marken- oder Domainverfügbarkeitsprüfung behauptet.
