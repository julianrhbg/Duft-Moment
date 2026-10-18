# Info und automatisches Farbschema

## Hauptablauf

Der dauerhaft sichtbare Footer-Link wurde entfernt. „Info“ sitzt mit mindestens 44 × 44 CSS-Pixeln im Kopfbereich neben dem Menü. Fachlich notwendige Einschränkungen stehen weiterhin direkt beim Rezept; ihr Detailzugang öffnet die Anwendungshinweise ohne Demo. Auch das Menü behält den direkten Quellenzugang.

Kleinere Überschriften, weniger enge Laufweite und eine zurückhaltendere Materialbeleuchtung beruhigen den Hauptablauf. Die Info-Erfahrung ist freiwillig und verändert keine Quizantworten oder Empfehlungen.

## Ein räumlicher Zusammenhang

Drei kompakte, abgerundete Flächen liegen zunächst übereinander, öffnen sich mit der Scrollposition und bilden schließlich Boden und zwei Wände eines Raums. Die wenigen Beschriftungen entsprechen Tätigkeit, Duftcharakter, Intensität und einer Mischung. Es gibt weder erfundene Wirkungen noch technische Erklärtexte oder Leistungsbehauptungen.

Die Demo verwendet eigene prozedurale, abgeschrägte Geometrie und einen kleinen WebGL-Renderer. Keine Grafikbibliothek, Modelle, Texturen oder fremde Medien. Kameraposition und Paneltransformationen folgen ausschließlich dem nativen Scrollstand. Die Kameradistanz berücksichtigt die tatsächlichen Geometriegrenzen, damit auch auf schmalen Displays der vollständige Raum sichtbar bleibt.

Der Kopfbereich mit „Anwendung & Quellen“ und Schließen bleibt sichtbar. Die Quellen sind vor jeder Scrollbewegung erreichbar. Kein Scroll-Hijacking, automatisches Scrollen, Ton oder obligatorisches Intro.

## Laden und Ressourcen

`info-demo.mjs` und `info-demo.css` werden erst beim Öffnen geladen; `info-room.mjs` erst bei tatsächlich benötigtem 3D. Der normale Quizstart lädt kein Demo-Modul und erzeugt keinen Grafikkontext.

Frames entstehen nur nach Scrollen, Größenänderung oder Schemawechsel. Keine kontinuierliche Render-Schleife. Unsichtbare Tabs pausieren. Beim Schließen werden RAF, Listener, ResizeObserver, Buffer, Shader, Programm und Grafikkontext freigegeben. Die maximale Pixeldichte beträgt 1,5, der Zeichenpuffer ist auf etwa 1,1 Millionen Pixel begrenzt. Das sind interne Rendergrenzen, keine behaupteten Geräte-Leistungsdaten.

Reduzierte Bewegung, Datensparmodus und konservativ erkannte schwache Geräte (höchstens 2 GB gemeldeter Speicher oder höchstens zwei logische Prozessoren) verwenden einen eigenständig gestalteten statischen CSS-Raum. Bei fehlendem oder verlorenem WebGL entsteht derselbe Fallback ohne unnötige lange Scrollstrecke. Die Browserangaben werden weder gespeichert noch versandt. Unbekannte Geräteprofile werden nicht als schwach behauptet.

## Navigation und Zustand

Info ist ein bildschirmfüllender nativer Dialog mit einem eigenen scrollbaren Inhalt. Ein flüchtiger History-Eintrag erlaubt Browser-Zurück und Vorwärts. Schließen und Escape kehren zum unveränderten Quizschritt bzw. Ergebnis zurück; die vorherige Fokusposition wird ohne Scrollsprung wiederhergestellt. Es erfolgt weder ein neuer Konfigurationsabruf noch eine neue Empfehlung durch das Schließen. Ein doppeltes Schließen springt nicht mehrfach im Verlauf zurück. Ein abgebrochener Lazy-Ladevorgang öffnet später keinen veralteten Dialog. Home und ein neuer Besuch beginnen weiterhin frisch.

## Hell und Dunkel

`prefers-color-scheme` und passende `theme-color`-Metadaten gelten ab dem ersten Laden. Texte, Konturen, Buttons, Fokus, Menüs, Formulare, Verwaltung, Meldungen und Materialien besitzen passende helle und dunkle Farben. Systemwechsel verändern keine Tageszeit- oder Jahreszeitenmotive. Bewegte Text- und Button-Farbübergänge wurden vermieden, damit beim Live-Wechsel keine kurzzeitig unleserlichen Kontraste entstehen.

## Tatsächliche Prüfung

- 24 unveränderte automatische Fach-/Servertests.
- 18 bestehende echte Chromium-Prüfungen des Hauptablaufs, einschließlich Smartphone, Tablet, Desktop und Verwaltung.
- 18 zusätzliche echte Info-/Schema-Prüfungen: Lazy Loading, Scrollgeometrie, sofortiger Quellenzugang, Zustands- und Fokusrückkehr, Browser-Zurück/Vorwärts, Live-Schemawechsel, reduzierte Bewegung, Datensparen, schwaches Geräteprofil, fehlender/verlorener Grafikkontext, Ressourcenfreigabe, Navigation während des Ladens erhaltene Verwaltungseingaben und Quellenzugriff bei nicht erreichbarer Konfiguration.

WebGL wurde im Chromium-Test mit einem Software-Grafiktreiber tatsächlich gerendert. Screenshots zeigen reale Browserausgaben; sie sind kein Nachweis der Bildrate auf jedem Smartphone. Safe Areas sind im CSS berücksichtigt, es wurde kein physisches Gerät mit Displayausschnitt vermessen.

## Hosting

Diese Änderungen betreffen ausschließlich die Oberfläche. Der vorhandene Server, die Auswahlregel, Produkt-/Rezeptdaten und der Validator bleiben bytegenau unverändert. Kein Konto, Passwort, Bestand oder gespeicherter Inhalt wurde durch die Überarbeitung zurückgesetzt.

Im zugänglichen GitHub-Branch ist kein zusätzlicher Sites-Adapter vorhanden. Die öffentliche Adresse antwortete beim Zugriff aus dieser Umgebung mit HTTP 403. Ein Sites-Veröffentlichungswerkzeug steht hier nicht zur Verfügung. Deshalb ist die Website unter ihrer bisherigen Adresse nicht als aktualisiert bestätigt. Hinweise zur Übernahme in das vorhandene Hosting: `docs/hosting-handoff.md`.

## Ansichten aus dem tatsächlichen Browserlauf

[Hauptansicht hell](preview/start-mobile.png) · [Hauptansicht dunkel](preview/start-dark-mobile.png) · [3D-Start](preview/info-start.png) · [Entfaltung](preview/info-middle.png) · [Dunkle mobile Demo](preview/info-dark-mobile.png) · [Statische Alternative](preview/info-static.png)

![Der aufgefaltete Raum im hellen Systemfarbschema](preview/info-room-light.png)

![Derselbe Raum im dunklen Systemfarbschema](preview/info-room-dark.png)
