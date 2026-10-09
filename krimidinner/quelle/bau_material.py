# -*- coding: utf-8 -*-
from rollen import ROLLEN, HINWEISE
import html

CSS = open('stil.css', encoding='utf-8').read()

def seite(inhalt, klasse=""):
    return f'<section class="page {klasse}">{inhalt}</section>'

def doc(titel, seiten):
    return f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>{titel}</title><style>{CSS}</style></head><body>{"".join(seiten)}</body></html>'

def kopf(rechts):
    return f'<div class="kopf"><span>🎃 Schloss Rabenstein · Die Nacht der Geister</span><span>{rechts}</span></div>'

seiten = []

# ---------- Spielregeln ----------
seiten.append(seite(kopf("Spielregeln für alle Gäste") + """
<h1>Willkommen auf Schloss Rabenstein</h1>
<p class="sub">Der Blutkelch-Mord · ein Halloween-Krimidinner</p>
<p>Graf Leopold von Rabenstein lädt jedes Jahr zu Halloween seine engsten Vertrauten zum Blutkelch-Bankett. Dieses Jahr hat er angekündigt, um Mitternacht ein Geheimnis zu lüften. Doch dazu wird es nicht kommen. Du bist einer der Gäste, und jemand am Tisch ist ein Mörder.</p>
<h2>So funktioniert der Abend</h2>
<ol>
 <li><b>Du bist deine Rolle.</b> Lies deine Rollenkarte in Ruhe, zeig sie niemandem und sprich, trink und streite im Stil deiner Figur. Kostüme und Dialekte sind ausdrücklich erwünscht.</li>
 <li><b>Fakten sind heilig, Geheimnisse sind verhandelbar.</b> Alles unter „Das ist die Wahrheit“ und „Was du beobachtet hast“ ist tatsächlich passiert. Dein Geheimnis und das, was du den anderen erzählst („Deine Version“), darfst du verteidigen, verdrehen und notfalls abstreiten. Spätestens in der Zeugenrunde legst du deine <b>Beobachtungen</b> offen auf den Tisch.</li>
 <li><b>Unschuldige dürfen über sich lügen, nicht über Fakten.</b> Du darfst verschweigen, wo du warst und warum. Du darfst aber nichts erfinden, was die Beweise verfälscht (zum Beispiel einen Zeugen, den es nicht gibt). <b>Nur der Mörder darf frei lügen</b> – aber auch er erfindet keine Beweisstücke.</li>
 <li><b>Redet miteinander.</b> Befragt euch gegenseitig, bildet Allianzen, verdächtigt, verteidigt euch. Notiere dir auf dem Ermittlungsbogen, was dir auffällt.</li>
 <li><b>Hinweiskarten</b> verteilt die Spielleitung (Inspektor Grau). Sie gelten für alle, lies sie laut vor und leg sie sichtbar in die Tischmitte.</li>
 <li><b>Keine Gewalt, keine Berührungen, kein Durchsuchen von Taschen.</b> Wenn jemand „Stopp“ sagt, ist das Spiel sofort für alle pausiert. Die Spielleitung hat das letzte Wort.</li>
 <li><b>Am Ende wird abgestimmt.</b> Du bekommst einen Stimmzettel: Wer war es, warum, wie, und was ist der entscheidende Beweis?</li>
</ol>
<div class="kasten"><b>Tipp:</b> Der beste Spieler ist nicht der, der gewinnt, sondern der, der die anderen bestens unterhält. Wenn du in der Unterhaltung stockst, frag: „Wo warst du zwischen 21:00 und 21:20 Uhr, und wer kann das bezeugen?“</div>
<h2>Die Nacht in Kürze</h2>
<table class="schmal"><tr><th>Akt</th><th>Was passiert</th></tr>
<tr><td>1 · Empfang</td><td>Ihr lernt euch kennen, stellt eure Figuren vor, die Vorspeise wird serviert.</td></tr>
<tr><td>2 · Der Mord</td><td>Der Toast, die Séance, die Dunkelheit. Der Graf stirbt.</td></tr>
<tr><td>3 · Ermittlung</td><td>Inspektor Grau verteilt Hinweise. Hauptgang, Befragungen, Zeugenrunde, Geheimnisse.</td></tr>
<tr><td>4 · Anklage</td><td>Dessert, Stimmzettel, Auflösung.</td></tr></table>
"""))

# ---------- Einladung (2 pro Seite) ----------
einl = lambda: """<div class="einl">
 <div style="font-size:30pt">🦇 🕯️ 🦇</div>
 <h2>Einladung zur Nacht der Geister</h2>
 <p><i>Graf Leopold von Rabenstein</i> gibt sich die Ehre, Sie zum alljährlichen<br><b>Blutkelch-Bankett auf Schloss Rabenstein</b> einzuladen.</p>
 <p>Datum: <span class="line"></span> Beginn: <span class="line" style="min-width:30mm"></span> Uhr</p>
 <p>Ort: <span class="line" style="min-width:100mm"></span></p>
 <p>Sie sind eingeladen als: <span class="line" style="min-width:75mm"></span></p>
 <p>Kostümvorschlag: <span class="line" style="min-width:95mm"></span></p>
 <p><i>„Um Mitternacht werde ich ein Geheimnis lüften, das manchem von Ihnen das Blut in den Adern gefrieren lässt.“</i></p>
 <p class="klein">Dresscode: Halloween. Bitte erscheinen Sie in Ihrer Rolle. Ihre Rollenkarte erhalten Sie am Abend (oder vorab per Post). Um Zusage bis <span class="line" style="min-width:30mm"></span> wird gebeten.</p>
</div>"""
seiten.append(seite(einl() + einl()))

# ---------- Namensschilder ----------
def tag(r):
    return f'<div class="tag"><div class="t1">🎃 Gast der Nacht der Geister</div><div class="nm">{r["name"]}</div><div class="tt">{r["titel"]}</div></div>'
tags = [tag(r) for r in ROLLEN]
seiten.append(seite('<div class="tags">' + "".join(tags[:10]) + '</div>'))
seiten.append(seite('<div class="tags">' + "".join(tags[10:]) + '</div>'))

# ---------- Menükarte ----------
seiten.append(seite("""<div class="menu">
<div style="font-size:34pt; margin-top:8mm">🕷️ 🎃 🕷️</div>
<h1>Das Bankett der Verdammten</h1>
<p class="sub">Gekocht von Berta Knochen, serviert von Baptiste Morrow</p>
<div class="gang"><small>Zur Begrüßung</small><b>Vampirkuss</b><i>Cranberry-Granatapfel-Sekt (auch ohne Alkohol)</i></div>
<div class="gang"><small>Erster Gang</small><b>Hexenkessel</b><i>Kürbiscremesuppe mit Spinnennetz aus Sahne und gerösteten Kürbiskernen</i></div>
<div class="gang"><small>Zweiter Gang</small><b>Das letzte Abendmahl</b><i>Hexengulasch mit Knochenbrötchen<br>(vegetarisch: Kürbis-Linsen-Eintopf)</i></div>
<div class="gang"><small>Dritter Gang</small><b>Friedhofserde & Blutkelch</b><i>Schokopudding mit Keksbröseln, Gummiwürmern und Marzipan-Grabsteinen<br>dazu Kirschgrütze im Kelch</i></div>
<div class="gang"><small>Zu trinken</small><b>Blutkelch-Bowle · Hexentrank · Gespensterwasser</b><i>Rote Bowle, grüne Waldmeister-Limonade, Wasser mit Gurken-Eiswürfeln</i></div>
<p class="klein" style="margin-top:14mm">Für Allergien und Unverträglichkeiten wenden Sie sich bitte an die Küche. Berta weiß Bescheid.</p>
</div>"""))

# ---------- Rollenkarten ----------
EMOJI = dict(stein="🩺", zora="🔮", edgar="🧟", berta="💀", baptiste="🕯️", lucian="🐺", morgana="🧛", agatha="🕷️", lilith="👻", jack="🎃", rosalie="🖤", pater="📿", dimitri="🦇")

def rolle_html(r):
    wahr = r["tat"] if r.get("mörder") else r["abend_wahr"]
    mord = ""
    beob = "".join(f"<li>{b}</li>" for b in r["beobachtung"])
    return seite(f"""
{kopf("Rollenkarte · streng vertraulich")}
<h1>{r["name"]} <span>{EMOJI[r["id"]]}</span></h1>
<div class="sub">{r["titel"]} · {r["alter"]} Jahre</div>
<div class="kostuem"><b>Kostüm:</b> {r["kostuem"]}</div>
<h3>Wer du bist (öffentlich bekannt)</h3><p>{r["oeffentlich"]}</p>
<h3>Dein Verhältnis zum Grafen</h3><p>{r["verhaeltnis"]}</p>
<div class="box geheim"><div class="label">🤫 Dein Geheimnis (streng geheim)</div><p style="margin:0">{r["geheimnis"]}</p></div>
<div class="box wahr"><div class="label">Das ist die Wahrheit über deinen Abend (21:00 bis 21:20)</div><p style="margin:0">{wahr}</p></div>
<h3>Deine Version (das erzählst du den anderen)</h3><p>{r["abend_version"]}</p>
<h3>Was du beobachtet hast (Fakten, die du spätestens in der Zeugenrunde nennst)</h3><ul>{beob}</ul>
<h3>So spielst du</h3><p>{r["runde2"]}</p>
<p><b>Dein Ziel:</b> {r["ziel"]}</p>
""", "rolle")

for r in ROLLEN:
    seiten.append(rolle_html(r))

# ---------- Ermittlungsnotizen ----------
namen = sorted(ROLLEN, key=lambda r: r["name"].replace("Dr. ","").replace("Sir ","").replace("Madame ","").replace("Gräfin ","").replace("Graf ","").replace("Pater ",""))
zeilen = "".join(f'<tr><td>{r["name"]}</td><td></td><td></td><td></td></tr>' for r in namen)
seiten.append(seite(kopf("Ermittlungsnotizen") + f"""
<h1>Mein Ermittlungsbogen</h1>
<p class="sub">Streiche Rollen durch, die heute nicht mitspielen.</p>
<table class="notiz"><tr><th>Wer</th><th>Motiv</th><th>Wo war er/sie 21:00 bis 21:20?</th><th>Auffälliges</th></tr>{zeilen}</table>
<div class="kasten"><b>Eure Leitfragen:</b> Wer hatte <b>Zugang</b> zur Tinktur? Wer hatte <b>Gelegenheit</b> (Kelch unbeaufsichtigt 21:05 bis 21:20)? Wer hatte ein <b>Motiv</b>? Wessen <b>Alibi</b> hält nicht?</div>
"""))

# ---------- Hinweiskarten ----------
def karte(h):
    runde = {1: "Wird nach dem Mord verlesen", 2: "Wird in der Zeugenrunde verlesen", 3: "Joker: auf Zuruf „Archiv!“"}[h["runde"]]
    return f'<div class="cut"><span class="num">{h["id"]}</span><h4>{h["titel"]}</h4><div class="klein" style="margin-bottom:3pt">{runde}</div><div>{h["text"]}</div></div>'
kk = [karte(h) for h in HINWEISE]
seiten.append(seite(kopf("Hinweiskarten · Ausschneiden") + '<h1>Beweisstücke</h1><p class="klein">Schneide die Karten entlang der gestrichelten Linie aus. Verteile sie, wie im Ablaufplan der Spielleitung angegeben.</p><div style="display:grid; gap:14pt; margin-top:14pt">' + kk[0] + kk[1] + kk[2] + '</div>'))
seiten.append(seite('<div style="display:grid; gap:12pt; padding-top:8pt">' + kk[3] + kk[4] + kk[5] + kk[6] + '</div>'))

# ---------- Stimmzettel ----------
def stimm():
    return """<div class="stimm">
 <div class="kopf" style="margin-bottom:4pt"><span>🎃 Stimmzettel · Anklage</span><span>Schloss Rabenstein</span></div>
 <div class="fld">Mein Name / meine Rolle:</div><div class="ln"></div>
 <div class="fld">Der Mörder des Grafen ist:</div><div class="ln"></div>
 <div class="fld">Sein Motiv (warum?):</div><div class="ln"></div><div class="ln"></div>
 <div class="fld">So hat er/sie es getan (womit, wann, wie?):</div><div class="ln"></div><div class="ln"></div>
 <div class="fld">Der entscheidende Beweis, der ihn/sie überführt:</div><div class="ln"></div><div class="ln"></div>
</div>"""
seiten.append(seite(stimm() + stimm()))

open('../Krimidinner_Spielmaterial.html', 'w', encoding='utf-8').write(doc("Krimidinner Spielmaterial", seiten))
print("pages built:", len(seiten))
