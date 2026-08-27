# Simon Mann — Website

Statische One-Page-Website (reines HTML/CSS/JS, kein Build-Schritt nötig).
Alle Inhalte liegen in einer einzigen `index.html`, die Navigation springt
per Anchor-Links (`#tour`, `#kontakt` usw.) zu den Abschnitten.

## Struktur

```
index.html          Die komplette Seite: Start, Über mich, Tour, Links, Presse, Kontakt
css/style.css        Alle Styles (Farb-Tokens ganz oben in :root)
js/shows-data.js     Tourdaten (siehe unten)
js/main.js           Nav, Parallax, Swipe-Stack, Formulare, Render-Logik für Termine
images/              Optimierte Web-Bilder (siehe Hinweis unten)
downloads/pressematerial.zip   Download-Paket für die Presse-Sektion
```

## Tourdaten pflegen

Termine liegen in `js/shows-data.js` als einfaches Array — kein CMS nötig:

```js
{
  date: "2026-10-08",        // JJJJ-MM-TT
  city: "Hamburg",
  venue: "Amandastr. 58",
  time: "20:00 – 22:00 Uhr",
  ticketUrl: "",              // leer lassen, bis Tickets online sind
  soldOut: false
}
```

Kommende/vergangene Termine werden automatisch anhand des heutigen Datums
sortiert und im Tour-Bereich angezeigt.

## Bilder

Im `images`-Ordner liegen nur komprimierte Web-Versionen (einige hundert KB
statt mehrerer MB) — die unbearbeiteten Original-Fotos in Kameraauflösung
wurden nach dem Komprimieren bewusst gelöscht, um das Repo klein zu halten.
Soll ein Bild ausgetauscht werden: neues Foto in `images/` ablegen,
komprimieren (z.B. mit Squoosh oder `sharp`, Zielgröße ca. 200–600 KB) und
den Dateinamen in `index.html` anpassen.

## Noch zu ergänzen

- **Impressum & Datenschutz:** Aktuell nur als Platzhalter-Text im Footer —
  in Deutschland gesetzlich vorgeschrieben, bitte vor dem Live-Gang eigene
  Seiten ergänzen und verlinken.
- **Newsletter:** Das Formular zeigt aktuell nur eine Bestätigung im Browser
  an, versendet aber noch nichts. Für echten Versand einen Anbieter
  (z.B. Brevo, Mailchimp, CleverReach) einbinden und das `<form>`-Tag in
  `index.html` entsprechend anpassen.
- **Bio-Texte:** Im Über-mich-Bereich steht bereits echter Text — bei Bedarf
  weiter verfeinern oder aktualisieren, sobald sich am Programm etwas ändert.

## Lokal ansehen

Kein Build nötig — einfach einen simplen Server starten (Doppelklick auf
`index.html` funktioniert auch, aber ein Server vermeidet Pfad-Probleme):

```bash
python -m http.server 8000
```

Dann [http://localhost:8000](http://localhost:8000) öffnen.

## Deployment

Da es sich um reine statische Dateien handelt, lässt sich der komplette
Ordner direkt auf jedem Static-Hosting hochladen — z.B. **GitHub Pages**
(Repo-Einstellungen → Pages → Branch `main`, Ordner `/`), Netlify, Vercel
oder klassisches Webhosting per FTP.
