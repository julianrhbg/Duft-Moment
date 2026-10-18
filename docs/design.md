# Gestaltung: eine Entscheidung im Mittelpunkt

## Direkter Einstieg

Die Tätigkeitsfrage ist die Startseite. Damit entfallen eine vorgeschaltete Werbeansicht und ein zusätzlicher Startklick. „Duft finden“ ordnet den Zweck ein; „1 / 3“ zeigt den Umfang. Danach gibt es nur Frage, Optionen und Zurück. Die übrigen Auswahltexte beschreiben nur Unterschiede, die für die Entscheidung helfen: die konkreten Duftnoten der drei Gruppen sowie die Morgenbeschränkung. Keine zusätzliche Frage.

Die ursprüngliche gespeicherte Standardfrage wird in der Oberfläche in „Was hast du vor?“ übersetzt. Individuell bearbeitete Fragen werden unverändert angezeigt. Der bisherige Einstiegstext bleibt im Datensatz und in der Verwaltung unter einem eigenen aufklappbaren Bereich erhalten. Keine Migration und kein Zurücksetzen von Nutzerinhalten.

## Ein Material statt mehrerer Inszenierungen

Die vorhandenen 24 lokalen saisonalen Illustrationen liegen in einem Lichtkörper mit matter Oberfläche, schmalem Rand und weichem Schatten. Der Körper bleibt vom Text und den Bedienflächen getrennt. Auf kleinen Bildschirmen schrumpft er neben die Frage; das Ergebnis priorisiert vollständig die Rezeptdaten. Es gibt keine verpflichtende Animation, Intro-Wartezeit, Partikel, Mausverfolgung, Audio, neue Medienanfragen oder 3D-Bibliothek.

Die Darstellung besteht aus CSS und den vorhandenen SVGs. Ohne Bild bleibt eine statische Materialfläche erhalten. Reduzierte Bewegung, Datensparmodus und die bestehende Bewegungspause schalten die kurzen Schrittübergänge ab. Es gibt keine dauerhafte Animation.

## Rezept vor Navigation

Mischungsname, Ölbezeichnungen und Zahlen bilden die stärkste Hierarchie. Ganze verifizierte Tropfen bzw. ausdrücklich gekennzeichnete Verhältnisse bleiben fachlich unverändert. Eine ungeprüfte Dosierung wird weiterhin direkt erklärt und nicht in ein Menü verschoben. Ersatzempfehlungen und fehlende Alternativen werden ebenfalls unmittelbar gekennzeichnet.

„Andere Mischung“ und „Auswahl ändern“ bleiben die beiden Ergebnisaktionen. Die bisher ständig sichtbaren Antwort-Chips entfallen. Ein gezielter Änderungsdialog erlaubt weiterhin den direkten Sprung zu jeder einzelnen Antwort. Anwendungshinweise und Quellen sind über den kleinen globalen Zugang und gegebenenfalls die Dosierungseinschränkung erreichbar.

## Entfernte sichtbare Inhalte

- Poetische Startüberschrift, Einleitung und Mottos.
- Überschriftenzusätze wie „Dein Vorhaben“ neben derselben eigentlichen Frage.
- Redundante Tätigkeitsbeschreibungen und Intensitätsumschreibungen.
- Jahreszeit-/Tageszeit-Beschriftung, Bildunterschrift, Blatt-Abzeichen, Unendlichkeitszahl und Footer-Slogans.
- Dekorative Auswahlsymbole und Pfeile; die gemeinsame Auswahlmarkierung zeigt nur den Auswahlzustand.
- Sichtbare Antwort-Chips im Ergebnis und große Willkommensformulierungen in der Verwaltung.

## Unveränderte Grundlage

Die Auswahlregel, Rezepte, Produkte, Dosierungsbedingungen, Server und serverseitige Validierung wurden nicht verändert. Bestandsänderungen werden vor den angebotenen Duftgruppen und vor jeder Empfehlung erneut berücksichtigt. Besucherdaten bleiben flüchtig. Home und BFCache-Wiederherstellung beginnen bei Frage eins. Keine Änderung von Konten oder dauerhaften Einstellungen durch die Designüberarbeitung.

## Tatsächliche Prüfung

24 bestehende automatisierte Tests prüfen Auswahl, Rotation, Dosierung und Serverfunktionen. Der überarbeitete Chromium-Lauf prüft mobile Touch-Bedienung bei 320 × 568, 360 × 640 und 390 × 844, Desktop bei 1440 × 950 und Tablet bei 768 × 1024. Reale Ansichten von Fragen, Verhältnis-Ergebnis, Änderungsdialog, Menü, Quellen, Einrichtung, Verwaltung und leerem Bestand wurden aufgerufen. Zusätzlich: Enter-Auswahl, sichtbarer Tastaturfokus, Escape und Fokusrückgabe, aktuelle Bestandsänderungen, Netzwerkfehler, verspätete Antworten, Medienausfall und Datensparmodus. BFCache wird über das zugehörige `pageshow`-Ereignis geprüft, nicht als Garantie jedes browserspezifischen Cachepfads.

Screenshots unter `docs/preview/` zeigen den tatsächlich ausgeführten Browserstand. Es wurde keine neue Website-Veröffentlichung behauptet. Die bisherige öffentliche Adresse kann aus dieser Umgebung weiterhin nicht aktualisiert werden; Quellcode und Vorschauen werden über das vorhandene GitHub-Repository bereitgestellt.
