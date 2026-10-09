# -*- coding: utf-8 -*-
from rollen import ROLLEN, HINWEISE

CSS = open('stil.css', encoding='utf-8').read()
R = {r["id"]: r for r in ROLLEN}

def seite(inhalt, klasse=""):
    return f'<section class="page {klasse}">{inhalt}</section>'

def kopf(rechts="Handbuch für die Spielleitung"):
    return f'<div class="kopf"><span>🎃 Der Blutkelch von Schloss Rabenstein</span><span>{rechts}</span></div>'

S = []

# ---------------- Titelseite ----------------
S.append(seite("""
<div class="titelseite">
 <div class="emoji">🎃🦇🕷️</div>
 <div class="untertitel">Ein Halloween-Krimidinner für 8 bis 13 Gäste</div>
 <div class="gross">Der Blutkelch von<br>Schloss Rabenstein</div>
 <p style="font-size:14pt; font-style:italic; color:#5b4a70">Handbuch für die Spielleitung</p>
 <p style="margin-top:34mm">Dauer: ca. 3 bis 3½ Stunden · inklusive Menü · ab 16 Jahren<br>
 7 bis 13 Rollen · eine Spielleitung (Inspektor Grau)</p>
 <div class="mordbox" style="max-width:120mm; margin:14mm auto 0; text-align:left">
  <b>⚠ Achtung, Spoiler!</b> Dieses Heft enthält die Lösung des Falls. Gib es nicht an deine Gäste weiter und lass es nicht auf dem Tisch liegen.
 </div>
</div>"""))

# ---------------- Auf einen Blick ----------------
S.append(seite(kopf() + """
<h1>Auf einen Blick</h1>
<h2>Worum geht es?</h2>
<p>An Halloween gibt Graf Leopold von Rabenstein auf seinem Schloss im Nebelmoor das jährliche <b>Blutkelch-Bankett</b>. Er hat angekündigt, um Mitternacht ein Geheimnis zu lüften und sein Testament zu verkünden. Doch nach dem Toast, mitten in der Séance, sinkt er tot zusammen: vergiftet. Die Gäste, alle mit eigenem Motiv und eigenem Geheimnis, sind durch den Sturm vom Rest der Welt abgeschnitten. Inspektor Grau (du!) leitet die Ermittlung.</p>
<h2>So läuft es ab</h2>
<ul>
 <li>Jede:r Gast bekommt eine <b>Rollenkarte</b> (1 Seite) mit öffentlichem Wissen, einem Geheimnis, der Wahrheit über die Tatzeit, einer Alibi-Version und eigenen Beobachtungen.</li>
 <li>Das Essen wird in <b>drei Gängen</b> serviert, dazwischen laufen Spielszenen. Du verteilst <b>Hinweiskarten</b> an festen Stellen.</li>
 <li>Am Ende gibt jeder einen <b>Stimmzettel</b> ab, und du löst auf.</li>
 <li>Die Lösung ist logisch ableitbar und enthält keine Zufallsfaktoren. Der Mörder wird durch <b>Widersprüche in seinem Alibi</b> und eine <b>Beweiskette</b> überführt.</li>
</ul>
<h2>Was du brauchst</h2>
<table class="schmal">
<tr><th style="width:36%">Was</th><th>Details</th></tr>
<tr><td>Gäste</td><td>8 bis 13 Mitspieler:innen plus du als Spielleitung (Notfall: 7 Rollen, wenn du mitzählst). Alle Rollen sind geschlechtsneutral spielbar: Anrede und Namen im Spielmaterial einfach mündlich anpassen.</td></tr>
<tr><td>Drucker</td><td>A4, Schwarz-Weiß reicht. Rollenkarten auf dünnes Papier, Hinweiskarten und Namensschilder auf Karton.</td></tr>
<tr><td>Raum</td><td>Ein Esstisch, in der Nähe eine Fläche für Befragungen (Sofaecke, Stehtisch). Dimmbares Licht oder Kerzen (LED-Kerzen sind sicherer).</td></tr>
<tr><td>Kleine Requisiten</td><td>Ein Pokal (der „Blutkelch“) mit dunklem Saft, ein Trenchcoat und Hut für Inspektor Grau, kleines braunes Fläschchen (für H2), Musik und ein Handy für Effekte (Gewitter, Glocke).</td></tr>
</table>
"""))

S.append(seite(kopf() + """
<h1>Druckliste</h1>
<p>Alle Seitenzahlen beziehen sich auf die Datei <b>Krimidinner_Spielmaterial.pdf</b>.</p>
<table class="schmal">
<tr><th>Seiten</th><th>Inhalt</th><th>Anzahl</th></tr>
<tr><td>1</td><td>Spielregeln</td><td>1× pro Gast</td></tr>
<tr><td>2</td><td>Einladung (2 pro Blatt, Felder von Hand ausfüllen)</td><td>1 Einladung pro Gast</td></tr>
<tr><td>3 bis 4</td><td>Namensschilder: nur die der mitspielenden Rollen ausschneiden</td><td>1×</td></tr>
<tr><td>5</td><td>Menükarte</td><td>1× pro Tischmitte oder 1 pro Gast</td></tr>
<tr><td>6 bis 18</td><td>Rollenkarten (Reihenfolge: Stein 6, Zora 7, Edgar 8, Berta 9, Baptiste 10, Lucian 11, Morgana 12, Agatha 13, Lilith 14, Jack 15, Rosalie 16, Pater 17, Dimitri 18)</td><td>nur die Rollen, die mitspielen, je 1×</td></tr>
<tr><td>19</td><td>Ermittlungsbogen</td><td>1× pro Gast</td></tr>
<tr><td>20 bis 21</td><td>Hinweiskarten H1 bis H7 (ausschneiden). H7 nur im Notfall oder wenn Agatha mitspielt.</td><td>1×</td></tr>
<tr><td>22</td><td>Stimmzettel (2 pro Blatt)</td><td>1 pro Gast, plus Reserve</td></tr>
</table>
<div class="hinweis"><b>Tipp:</b> Wer den Mörder spielt, bestimmst du. Wähle jemanden, der gern lügt und schauspielert. Die Rollenkarten sehen alle gleich aus. Stecke jede Karte in einen Umschlag und verteile die Umschläge erst am Abend, oder schick sie eine Woche vorher.</div>
"""))

# ---------------- Die Lösung in einer Minute ----------------
S.append(seite(kopf("Nur für die Spielleitung") + f"""
<h1>Die Lösung in einer Minute</h1>
<div class="mordbox">
 <b>Der Mörder ist Dr. Viktor Stein, der Hausarzt.</b><br>
 <b>Motiv:</b> Der Graf wollte um Mitternacht öffentlich gestehen, vor über 25 Jahren seinen Bruder Albrecht mit Eisenhut im Blutkelch vergiftet zu haben. Stein hatte damals gegen Bezahlung (50.000 DM) „Herzversagen“ auf den Totenschein geschrieben. Auch er wäre ruiniert gewesen.<br>
 <b>Methode:</b> Eisenhut-Tinktur (Tinctura Aconiti) aus seiner Arzttasche, in den Blutkelch gekippt, als dieser zwischen 21:05 und 21:20 allein auf der Anrichte stand.<br>
 <b>Falscher Alibi-Satz:</b> „Ich war die ganze Zeit bei Madame Zora im Kaminzimmer.“
</div>
<h2>Die Beweiskette (so überführen deine Gäste ihn)</h2>
<ol>
 <li><b>Die Tatsache:</b> Eisenhut-<b>Tinktur</b> im Kelch, keine Pflanzenteile (H1). Die Phiole mit dem Apotheken-Etikett liegt hinter dem Vorhang (H2). Das Gift stammt <b>nicht</b> aus Gewächshaus, Séance-Koffer oder Grafen-Liniment (H6, Jack, Baptiste, Zora).</li>
 <li><b>Das Zeitfenster:</b> 21:05 bis 21:20, der Kelch war allein im Rittersaal (H4, Baptiste).</li>
 <li><b>Die Gestalt:</b> Umhang und schwarze Handschuhe (Berta, Morgana, Rosalie) mit <b>Schnabel</b>-Schatten (Edgar). Schnabel haben nur der <b>Pestarzt</b> (Stein) und der <b>Rabe</b> (Rosalie). Rosalie hat ein Alibi bei Jack.</li>
 <li><b>Das gebrochene Alibi:</b> Zora sah Stein erst <b>gegen 21:15</b>. Lucian sah Zora um 21:06 <b>allein</b> im Kaminzimmer. Rosalie sah um 21:19, wie er die Handschuhe wegsteckte. Er log also.</li>
 <li><b>Das Motiv:</b> Zettel des Grafen (H3, H5): „… wer den Totenschein unterschrieb …“. Baptiste und Agatha (H7): Der Totenschein 1998 trägt Steins Unterschrift. Zora, Lucian, Lilith und Pater: Der Graf wollte um Mitternacht gestehen.</li>
 <li><b>Das Sahnehäubchen:</b> Bei der „Durchsuchung“ hat Steins Medikamentenetui ein <b>leeres 5-ml-Fach</b> mit dem Etikett „Tinct. Aconiti, Apotheke Schwarzmoor“.</li>
</ol>
<h2>Wer weiß welchen Schlüsselhinweis?</h2>
<table class="schmal">
<tr><th>Schlüsselhinweis</th><th>Quelle(n)</th></tr>
<tr><td>Schnabel-Schatten an der Anrichte (21:10)</td><td>Edgar</td></tr>
<tr><td>Umhang und schwarze Handschuhe an der Anrichte (21:09)</td><td>Berta, Morgana (21:11, Galerie)</td></tr>
<tr><td>Stein zieht Handschuhe aus (21:19)</td><td>Rosalie</td></tr>
<tr><td>Stein kam erst 21:15 zu Zora</td><td>Zora; Lucian (Zora um 21:06 allein)</td></tr>
<tr><td>Eisenhut stammt nicht aus Garten / Koffer / Liniment</td><td>H6 (Jack, Zora, Baptiste liefern die Details)</td></tr>
<tr><td>Der Graf wollte um Mitternacht beichten</td><td>H3, Zora, Lucian, Lilith, Pater (andeutend)</td></tr>
<tr><td>Stein unterschrieb den Totenschein 1998</td><td>Baptiste, Pater (Kirchenbuch), Agatha / H7</td></tr>
<tr><td>Der Graf hat Albrecht 1998 vergiftet</td><td>Berta, Lucian (Brief), Zora, Pater (Beichtgeheimnis!)</td></tr>
</table>
<p class="klein">Die sieben Kernrollen (Stein, Zora, Edgar, Berta, Baptiste, Lucian, Morgana) liefern allein jeden Schlüsselhinweis. Alle weiteren Rollen verdichten das Netz und liefern falsche Fährten (Red Herrings).</p>
"""))

# ---------------- Besetzung ----------------
rt = lambda ids: ", ".join(R[i]["name"] for i in ids)
S.append(seite(kopf() + """
<h1>Besetzung nach Gruppengröße</h1>
<p>Die Rollen sind so gebaut, dass jede Gästezahl von <b>7 bis 13</b> Rollen funktioniert. Beginne immer mit den Kernrollen und füge in dieser Reihenfolge hinzu:</p>
<table>
<tr><th style="width:18%">Rollen</th><th>Besetzung</th><th style="width:32%">Warum diese Reihenfolge</th></tr>
<tr><td><b>7</b> (Minimum)</td><td>Dr. Stein, Madame Zora, Sir Edgar, Berta, Baptiste, Lucian, Gräfin Morgana</td><td>Diese sieben tragen die komplette Beweiskette.</td></tr>
<tr><td><b>8</b></td><td>+ Agatha Grimm</td><td>Fachwissen (Gift) und die Archivmappe H7.</td></tr>
<tr><td><b>9</b></td><td>+ Lilith Schwarz</td><td>Widerlegt Morganas Bibliotheks-Lüge, bestätigt Streit.</td></tr>
<tr><td><b>10</b></td><td>+ Jack Kürbiss</td><td>Liefert den Eisenhut-Bestand und das Liebespaar.</td></tr>
<tr><td><b>11</b></td><td>+ Rosalie</td><td>Braucht Jack als Alibi. Trägt eine Schnabelmaske (Red Herring).</td></tr>
<tr><td><b>12</b></td><td>+ Pater Ambrosius</td><td>Beichtgeheimnis: schöner Rollenkonflikt.</td></tr>
<tr><td><b>13</b></td><td>+ Graf Dimitri Vlad</td><td>Braucht den Pater als Alibi. Schwarzer Umhang (Red Herring).</td></tr>
</table>
<div class="kasten"><b>Rechenbeispiel:</b> Du hast 10 Gäste und spielst selbst nicht mit, dann sind das 10 Rollen: die 7 Kernrollen plus Agatha, Lilith und Jack. Hast du 10 Personen <i>inklusive</i> dir, dann nimm 9 Rollen.</div>
<h2>Wenn jemand kurzfristig ausfällt</h2>
<ul>
 <li><b>Nie ausfallen darf:</b> Dr. Stein (der Mörder). Fällt er aus, übernimmst du die Rolle oder gibst sie an einen der Nebenrollen-Spieler:innen weiter, dessen Rolle du dann wegfallen lässt.</li>
 <li><b>Fehlende Zeugenrolle:</b> Lies die „Beobachtungen“ der fehlenden Rolle in der Zeugenrunde als Aussage „aus der Akte“ vor („Dem Inspektor liegt eine schriftliche Aussage von … vor“).</li>
 <li><b>Fehlt Zora</b>, benutze zusätzlich die Aussage von Lucian: „Um 21:06 war Zora allein im Kaminzimmer.“ Das reicht, um Steins Alibi zu brechen.</li>
 <li><b>Fehlt Agatha</b>, gib H7 im Joker-Moment („Archiv!“) selbst heraus.</li>
</ul>
"""))

S.append(seite(kopf() + """
<h1>Rollen: Kurzprofile</h1>
<p>Zur Orientierung: Motiv und Geheimnis jeder Rolle auf einen Blick.</p>
<table class="schmal">
<tr><th style="width:21%">Rolle</th><th>Kostüm</th><th style="width:38%">Motiv / Geheimnis</th></tr>
""" + "".join(f'<tr><td><b>{r["name"]}</b></td><td>{r["kostuem"].split(":")[0]}</td><td>{r["motiv_kurz"]}</td></tr>' for r in ROLLEN) + """
</table>
"""))

# ---------------- Zeitplan ----------------
S.append(seite(kopf() + """
<h1>Ablaufplan auf einer Seite</h1>
<p class="klein">Die Zeiten sind Richtwerte, gerechnet ab Beginn. „SZ“ steht für Spielzeit (die Uhrzeit im Spiel).</p>
<table class="schmal">
<tr><th style="width:11%">Beginn</th><th style="width:22%">Phase</th><th>Was passiert</th><th style="width:16%">Du verteilst</th></tr>
<tr><td>+0:00</td><td><b>1 · Empfang</b> (30 Min.)</td><td>Gäste kommen an: Aperitif, Namensschild, Umschlag mit Rollenkarte. Du bist als „Graf Leopold“ Gastgeber. Die Gäste lesen ihre Rolle.</td><td>Rollenkarten, Regeln, Namensschilder</td></tr>
<tr><td>+0:30</td><td><b>2 · Prolog und Vorstellung</b> (20 Min.)</td><td>Prolog, Rede des Grafen. Vorstellungsrunde reihum. Vorspeise „Hexenkessel“.</td><td>–</td></tr>
<tr><td>+0:55</td><td><b>3 · Der Mord</b> (10 Min.)</td><td>Zeitsprung auf SZ 21:30. Toast, Séance (Licht aus), Schrei. Der Graf stirbt. Du wechselst die Rolle.</td><td>–</td></tr>
<tr><td>+1:05</td><td><b>4 · Tatortbefund</b> (15 Min.)</td><td>Inspektor Grau übernimmt. Die Karten H4, H1, H2, H3 werden verlesen. Hauptgang wird serviert.</td><td>H4, H1, H2, H3</td></tr>
<tr><td>+1:20</td><td><b>5 · Befragung 1</b> (25 Min.)</td><td>Freies Gespräch beim Hauptgang: jeder befragt jeden. Notizen auf dem Ermittlungsbogen.</td><td>–</td></tr>
<tr><td>+1:45</td><td><b>6 · Zeugenrunde</b> (20 Min.)</td><td>Du rufst jeden einzeln auf: Wo waren Sie 21:00 bis 21:20 Uhr? Was haben Sie gesehen? Danach folgen H5 und H6.</td><td>H5, H6</td></tr>
<tr><td>+2:05</td><td><b>7 · Befragung 2 / Geheimnisse</b> (25 Min.)</td><td>Masken fallen: Geständnisse, Anschuldigungen. Du rufst „Durchsuchung!“ (siehe Durchsuchungsbericht) und bei Bedarf „Archiv!“ (H7).</td><td>H7 (Joker)</td></tr>
<tr><td>+2:30</td><td><b>8 · Dessert und Abstimmung</b> (15 Min.)</td><td>Dessert wird serviert. Alle füllen den Stimmzettel aus.</td><td>Stimmzettel</td></tr>
<tr><td>+2:45</td><td><b>9 · Anklage und Auflösung</b> (25 Min.)</td><td>Jeder nennt seinen Verdacht in einem Satz. Stimmen auszählen, Mörder gesteht, Auflösung, Epilog.</td><td>–</td></tr>
<tr><td>+3:10</td><td><b>10 · Ausklang</b></td><td>Auszeichnungen, Fotos, Bowle.</td><td>–</td></tr>
</table>
<div class="hinweis"><b>Zeitmanagement:</b> Plane den Hauptgang so, dass er <i>vor</i> Phase 4 fertig im Ofen ist oder kalt serviert werden kann (Gulasch lässt sich warmhalten). Während der Befragungen soll niemand in die Küche rennen: Wer kocht, spielt besser Berta oder verzichtet auf das Mitspielen.</div>
<h3>Wenn es schneller gehen soll (ca. 2,5 Std.)</h3>
<ul><li>Streiche Befragung 1 oder verkürze beide Befragungen auf je 15 Minuten.</li>
<li>Lass die Vorstellungsrunde auf einen Satz pro Person kürzen.</li></ul>
<h3>Hinweis zur Uhrzeit im Spiel</h3>
<p>Das Spiel zeigt an einem Abend zwei Zeitachsen. Die <b>Spielzeit</b> (SZ) umfasst 19:30 bis 21:45 Uhr in der Geschichte. Alle Alibis beziehen sich auf die Phase <b>21:00 bis 21:20 Uhr SZ</b>.</p>
"""))

# ---------------- Akt 1 + 2 ----------------
S.append(seite(kopf() + """
<h1>Phase 1 und 2: Empfang, Prolog, Vorstellung</h1>
<h2>Empfang (+0:00)</h2>
<ul>
 <li>Du begrüßt jeden an der Tür in der Rolle des <b>Grafen Leopold</b> (Umhang, Hausherrn-Pose). Gib Namensschild und Umschlag mit Rollenkarte.</li>
 <li>Lasse jeden 10 Minuten für die Rollenkarte. Wer will, darf nachfragen. <b>Erkläre die Spielregeln mündlich</b> in einer Minute (Fakten sind heilig, Geheimnisse verhandelbar, nur der Mörder darf frei lügen).</li>
 <li>Aperitif „Vampirkuss“. Stimmungsvolle Musik, Licht gedimmt.</li>
</ul>
<h2>Prolog (+0:30): zum Vorlesen</h2>
<div class="regie">Licht dimmen, Kerzen anzünden, Gewitter leise im Hintergrund. Setz dich ans Kopfende.</div>
<div class="lesen">„Die Nacht des 31. Oktober. Nebel kriecht über das Moor, und in den Mauern von Schloss Rabenstein flüstern die Toten. Einmal im Jahr, wenn sich der Schleier zwischen den Welten hebt, lädt Graf Leopold von Rabenstein seine engsten Vertrauten zum Blutkelch-Bankett: Festmahl, Maskenball und Geisterbeschwörung in einer einzigen Nacht. Doch in diesem Jahr ist alles anders. Der Graf hat angekündigt, um Mitternacht ein Geheimnis zu lüften und sein Testament zu verkünden. Manch einer unter den Gästen wird bei diesem Gedanken blass, und das liegt nicht nur an der Schminke. Willkommen auf Schloss Rabenstein. Möge die Nacht Ihnen gnädig sein.“</div>
<h2>Rede des Grafen (du als Graf Leopold)</h2>
<div class="lesen">„Meine lieben Gäste, willkommen auf Rabenstein! Ich sehe lauter vertraute Gesichter, und hinter jedem Gesicht ein Geheimnis. Vermutlich ist das der Grund, warum wir uns so gut verstehen. <span class="regie">(Pause, Blick in die Runde.)</span> Ein Vierteljahrhundert lang habe ich geschwiegen. Heute Nacht, um Mitternacht, breche ich dieses Schweigen, und ich verspreche Ihnen: Manch einer von Ihnen wird mir danken. Mancher auch nicht. <span class="regie">(Lächeln.)</span> Doch zuerst wird gegessen! Um halb zehn erheben wir den Blutkelch der Rabensteins, aus dem der Hausherr seit dreihundert Jahren an Halloween trinkt. Danach ruft uns Madame Zora ins Reich der Geister. Essen Sie, trinken Sie, und fürchten Sie sich ein wenig!“</div>
<h2>Vorstellungsrunde (+0:40)</h2>
<p>Jeder stellt seine Figur <b>in zwei bis drei Sätzen</b> vor. Als Gerüst dienen die Abschnitte „Wer du bist (öffentlich)“ und „Dein Verhältnis zum Grafen“. Geheimnisse bleiben natürlich geheim. Beginne links von dir und lass die Vorspeise servieren, während die Runde läuft.</p>
<div class="hinweis"><b>Atmosphärentipp:</b> Während die Gäste sich vorstellen, notiere dir unauffällig, wer besonders gern schauspielert: Diese Personen kannst du später für den Auftritt bei der Anklagerunde („Bester Zeuge“) loben.</div>
"""))

S.append(seite(kopf() + """
<h1>Phase 3: Der Mord</h1>
<h2>Vorbereitung</h2>
<ul>
 <li>Stelle den <b>Blutkelch</b> (Pokal) mit dunkelrotem Saft auf deinen Platz. Lege Hut und Trenchcoat des Inspektors griffbereit unter den Stuhl.</li>
 <li>Gewitter-Geräusch und ein Schrei (oder du schreist selbst) liegen als Handy-Audio bereit. Eine Taschenlampe hilft beim „Lichtausfall“.</li>
 <li>Bitte <b>Zora</b> vorab diskret: „Wenn ich sage ‚Madame Zora, es ist so weit‘, löschst du die Kerzen und beginnst die Séance.“</li>
</ul>
<h2>Zeitsprung und Toast (zum Vorlesen / Spielen)</h2>
<div class="regie">Stehe auf, hebe den Kelch.</div>
<div class="lesen">„Es ist halb zehn. Meine Freunde: der Blutkelch der Rabensteins. Ein Schluck für die Toten, die nicht ruhen, und einer für die Lebenden, die schweigen. <span class="regie">(hebt den Kelch)</span> Auf die Toten, die nicht ruhen – und auf die Lebenden, die schweigen!“</div>
<div class="regie">Trink einen kräftigen Schluck. Alle prosten dir zu.</div>
<div class="lesen">„Madame Zora, es ist so weit. Rufen Sie die Geister!“</div>
<h2>Die Séance (+0:55)</h2>
<div class="regie">Zora löscht die Kerzen, Licht aus, nur Taschenlampe/Kerze auf dem Tisch. Musik: Gewitter und Glocke.</div>
<p><b>Zora</b> improvisiert: „Albrecht von Rabenstein, wir rufen dich! Wenn du uns hörst, gib uns ein Zeichen …“ Du (Graf) antwortest zitternd:</p>
<div class="lesen">„Albrecht … bist du das? … Verzeih mir … ich wollte … mein Herz … es prickelt … <span class="regie">(greift sich an die Brust, Kelch fällt um)</span> Ich … Albrecht!“</div>
<div class="regie">Brich theatralisch zusammen, Schrei (Audio), kurze Dunkelheit (3 bis 5 Sekunden), dann Licht an. Liege reglos. Warte kurz, bis die Gäste reagieren, dann stehe leise auf, setze Hut und Trenchcoat auf.</div>
<h2>Inspektor Grau tritt auf</h2>
<div class="lesen">„Bitte bleiben Sie ruhig und auf Ihren Plätzen. Mein Name ist Grau, Inspektor Grau. Ich war eigentlich nur auf der Durchreise, doch der Nebel hat mich hierhergeführt, und der Graf hat mich noch heute Nachmittag eingeladen. Wie Sie sehen: Er hat wirklich Pech mit seinen Gästen. <span class="regie">(Pause)</span> Graf Leopold von Rabenstein ist tot. Die Brücke über das Moor ist vom Sturm weggerissen, die Polizei trifft frühestens morgen ein. Das heißt: Der Mörder sitzt in diesem Raum, und er kann hier nicht weg. Wir haben einen Abend, ihn zu finden.“</div>
"""))


S.append(seite(kopf() + """
<h1>Phase 4 und 5: Tatortbefund und Befragung</h1>
<h2>Tatortbefund (+1:05)</h2>
<p>Lies die Hinweiskarten laut vor (in dieser Reihenfolge) und lege sie in die Tischmitte:</p>
<table class="schmal"><tr><th style="width:9%">Karte</th><th>Wie du sie einführst</th></tr>
<tr><td>H4</td><td>„Zunächst der Ablauf des Abends, so wie ihn der Butler und die Gäste geschildert haben …“ (Zeitablauf, Tatzeitfenster 21:05 bis 21:20)</td></tr>
<tr><td>H1</td><td>„Das ist der vorläufige Befund zum Blutkelch.“</td></tr>
<tr><td>H2</td><td>„Hinter dem Vorhang, neben der Anrichte, fand ich dies.“ (Wenn du ein braunes Fläschchen hast, lege es auf den Tisch.)</td></tr>
<tr><td>H3</td><td>„In der Jackentasche des Grafen steckte ein Zettel. Der Rest fehlt …“</td></tr></table>
<p>Schließe: „Die Hauptspeise wird serviert, und Sie dürfen miteinander reden. Aber denken Sie daran: <i>Einer von Ihnen lügt.</i>“</p>
<h2>Befragung 1 (+1:20): freies Gespräch</h2>
<p>Die Gäste bewegen sich frei und befragen einander. Du hörst zu, hilfst bei Fragen und notierst, welche Alibis schon gefallen sind. Gib Impulse:</p>
<ul>
 <li>„Wer hatte Zugang zu Eisenhut?“</li>
 <li>„Wer war zwischen 21:05 und 21:20 im Rittersaal oder in der Nähe?“</li>
 <li>„Warum hat sich der Graf gerade heute zu einem Geständnis entschlossen?“</li>
</ul>
"""))

# ---------------- Akt 4 + 5 ----------------
S.append(seite(kopf() + """
<h1>Phase 6 und 7: Zeugenrunde und Geheimnisse</h1>
<h2>Zeugenrunde (+1:45): Pflichtteil</h2>
<p>Rufe jede Rolle einzeln auf (Reihenfolge nach Belieben, <b>Stein nicht als Erster und nicht als Letzter</b>). Jeder sagt in <b>maximal zwei Minuten</b>:</p>
<ol><li>Wo war ich zwischen 21:00 und 21:20 (<b>Deine Version</b>)?</li><li>Was habe ich beobachtet (<b>Beobachtungen</b>)? Beobachtungen muss jede Rolle nennen. Wenn jemand etwas vergisst, fragst du nach.</li></ol>
<p>Danach verlies H5 und H6:</p>
<table class="schmal"><tr><th style="width:9%">Karte</th><th>Einführung</th></tr>
<tr><td>H5</td><td>„Die zweite Hälfte des Zettels. Sie lag zerknüllt im Papierkorb des Arbeitszimmers.“</td></tr>
<tr><td>H6</td><td>„Ich habe Gewächshaus, Séance-Koffer und Arbeitszimmer kontrolliert. Ergebnis: …“</td></tr></table>
<h2>Befragung 2 / Geheimnisse (+2:05)</h2>
<p>Verkünde: „Jeder von Ihnen hat etwas zu verbergen, und ich weiß, dass nicht alle Geheimnisse mit dem Mord zu tun haben. Aber jedes Geheimnis, das nicht herauskommt, hält den wahren Mörder im Schatten. Wer jetzt gesteht, hilft sich selbst.“</p>
<ul>
 <li>Gib Gästen, die zögern, einen Anstoß: „Haben Sie dem Inspektor nicht etwas zu sagen?“</li>
 <li>Rufe bei Bedarf <b>„Durchsuchung!“</b> aus und lies die Ergebnisse (nächste Seite) vor. Beginne mit den harmlosen Rollen und <b>lies Stein zuletzt</b>.</li>
 <li>Rufe <b>„Archiv!“</b> aus, wenn die Gruppe stockt: Agatha legt die Mappe (H7) vor oder du übergibst sie.</li>
</ul>
<h2>Die Joker-Leiter, wenn die Gruppe feststeckt</h2>
<table class="schmal">
<tr><th style="width:8%">Stufe</th><th>Hinweis</th></tr>
<tr><td>1</td><td>„Prüfen Sie die Alibis: Wer hat sich selbst in Widersprüche verstrickt?“</td></tr>
<tr><td>2</td><td>„Wer trug zur Tatzeit etwas mit einem langen Schnabel?“</td></tr>
<tr><td>3</td><td>„Vergleichen Sie Zoras Aussage mit Steins Alibi, und wann Lucian Zora gesehen hat.“</td></tr>
<tr><td>4</td><td>„Archiv!“ (H7) und „Durchsuchung!“</td></tr>
<tr><td>5</td><td>„Der Täter besitzt Eisenhut-Tinktur aus einer Apotheke. Wer ist Arzt?“</td></tr>
</table>
"""))

# ---------------- Durchsuchung ----------------
dur = {
 "morgana": "Im Zimmer der Gräfin steht ein gepackter Koffer, daneben die Visitenkarte eines Scheidungsanwalts.",
 "lucian": "Unter Lucians Matratze: Mahnungen und Schuldscheine über zusammen 200.000 €.",
 "lilith": "In Liliths Schreibtisch: Kontoauszüge eines Privatkontos mit regelmäßigen Überweisungen vom Hauskonto.",
 "edgar": "In Edgars Aktentasche: Brief der Bank („Kündigung der Kreditlinie“) und ein Insolvenzratgeber.",
 "baptiste": "In Baptistes Pantry: ein Notizbuch mit einer Liste verkaufter Weinflaschen und Zahlungseingängen.",
 "berta": "In Bertas Küche: die fristlose Kündigung mit Datum von heute und Bertas zerknülltem Antwortentwurf.",
 "zora": "In Zoras Koffer: Angelschnur, Magnete, eine kleine Glocke an Fäden, ein Mini-Lautsprecher und ein Nebelgerät. (Tricks!)",
 "agatha": "In Agathas Tasche: ein Manuskript mit dem Titel „Chronik eines Verbrechens: Der Graf von Rabenstein“.",
 "jack": "In Jacks Gartenkittel: ein Liebesbrief von Rosalie, Erde an den Fingern, aber kein Gift.",
 "rosalie": "In Rosalies Skizzenbuch: Zeichnungen von Jack. Die Schnabelmaske hängt an der Garderobe.",
 "pater": "In Ambrosius’ Brevier: ein Zettel „Ich darf nichts sagen. Gott vergebe uns.“",
 "dimitri": "In Dimitris Umhang: ein Brecheisen und ein altes Foto vom Blutrubin.",
 "stein": "In Dr. Steins Arzttasche: Stethoskop, Verbandszeug … und ein Medikamentenetui mit <b>einem leeren Fach</b> für ein 5-ml-Fläschchen. Der Etikettenrest im Futteral lautet <b>„Tinct. Aconiti – Apotheke Schwarzmoor“</b>. Dazu ein Paar schwarze Lederhandschuhe, die bitter riechen.",
}
S.append(seite(kopf() + """
<h1>Durchsuchungsbericht</h1>
<p>Rufe „Durchsuchung!“ aus. Du lässt die Gäste nicht selbst suchen, sondern liest für <b>jede mitspielende Rolle</b> den Befund vor. Zeige dabei keine Eile und betone die schwächeren Befunde („Das ist nur ein Hobby …“). <b>Dr. Stein liest du zuletzt vor.</b></p>
<table>
<tr><th style="width:26%">Rolle</th><th>Befund</th></tr>
""" + "".join(f'<tr><td>{R[i]["name"]}</td><td>{dur[i]}</td></tr>' for i in ["morgana","lucian","lilith","edgar","baptiste","berta","zora","agatha","jack","rosalie","pater","dimitri","stein"]) + """
</table>
<div class="hinweis"><b>Wichtig:</b> Diese Befunde enthüllen niemals den Mörder allein, sondern bestätigen die Hypothese der Gruppe. Dr. Steins Fund ist ein Indiz, kein Geständnis: Er darf sich herausreden („Das Fach war schon lange leer“), und die Gruppe muss die Beweise zusammenfügen.</div>
"""))

# ---------------- Abstimmung + Auflösung ----------------
S.append(seite(kopf() + """
<h1>Phase 8 und 9: Abstimmung, Anklage, Auflösung</h1>
<h2>Abstimmung (+2:30)</h2>
<p>Serviere das Dessert. Verteile die <b>Stimmzettel</b> (fünf Minuten Zeit, ohne abzusprechen). Fülle auch du einen Zettel aus, um den Fall abzurunden.</p>
<h2>Anklagerunde</h2>
<p>Lies die Zettel nicht vor. Lass jeden in <b>einem Satz</b> sagen: „Ich klage … an, weil …“. Zähle die Stimmen an einer Tafel oder auf einem Zettel mit. Danach fragst du:</p>
<div class="lesen">„Gibt es jemanden hier, der noch etwas gestehen möchte, bevor ich das Ergebnis verkünde? <span class="regie">(Pause, Blick zu Stein)</span> Nein? Dann sehen wir uns die Stimmen an …“</div>
<p>Verkünde das Ergebnis: Wer hat die meisten Stimmen? <b>Ist es Stein</b>, gratulierst du der Gruppe. <b>Ist es jemand anderes</b>, verkündest du das Ergebnis, deutest aber an, dass „der Fall noch nicht ganz zu Ende ist“, und liest die Auflösung ohnehin vor.</p>
<h2>Auflösung: zum Vorlesen</h2>
<div class="lesen">„Meine Damen und Herren, der Mörder des Grafen Leopold von Rabenstein ist … <span class="regie">(Pause)</span> <b>Dr. Viktor Stein</b>.<br><br>
Vor über 25 Jahren, an Halloween 1998, starb Albrecht von Rabenstein nach einem Abendessen. Es war der Graf selbst, der seinem Bruder den vergifteten Blutkelch reichte. Der junge, verschuldete Arzt Viktor Stein schrieb auf den Totenschein ‚Herzversagen‘ und bekam dafür 50.000 Mark. Seitdem lebte er vom Schweigen des Grafen, und sein Sanatorium wurde mit dessen Geld gebaut.<br><br>
Als der Graf sich entschloss, um Mitternacht alles zu gestehen, wusste Stein, dass auch er verloren war. Er wartete, bis Baptiste den Kelch auf der Anrichte abgestellt hatte und vom Graf weggerufen wurde. Dann kippte er Eisenhut-Tinktur aus seiner Arzttasche in den Wein, derselbe Wein, derselbe Kelch, dasselbe Gift wie vor 25 Jahren. Berta erschreckte ihn mit ihrem Tablett, und er versteckte die leere Phiole hinter dem Vorhang. Sein Alibi bei Madame Zora war eine Lüge: Zora sah ihn erst um Viertel nach, Lucian sah sie um sechs nach neun allein. Edgar sah den Schnabelschatten, Berta und Morgana den Umhang und die schwarzen Handschuhe, Rosalie sah ihn die Handschuhe wegstecken. Und der Zettel des Grafen sagt es selbst: ‚Wer damals den Totenschein unterschrieb …‘<br><br>
Das Gift stammte nicht aus dem Gewächshaus, nicht aus Zoras Koffer und nicht aus dem Vorrat des Grafen, sondern aus einer Apotheke, und aus einer Arzttasche. Dr. Stein: Der Fall ist gelöst.“</div>
<p class="regie">Wenn die Gäste es wünschen, darf Stein jetzt einen Monolog halten („Ich hatte keine Wahl …“). Das ist der Höhepunkt der Rolle.</p>
"""))

# ---------------- Epilog + Wahrheit ----------------
epi = {
 "stein": "Dr. Stein wird in Handschellen abgeführt. Sein Sanatorium wird geschlossen, die Zulassung entzogen.",
 "zora": "Zora gesteht ihre Tricks, wird aber für ihre „Hilfe bei den Ermittlungen“ gefeiert und bekommt eine eigene Fernsehshow.",
 "edgar": "Edgars Firma meldet Insolvenz an. Er startet unter falschem Namen als Hotelier im Moor.",
 "berta": "Berta erhält vom Erbe des Grafen eine lebenslange Rente und kocht weiter, aber nur noch, was sie will.",
 "baptiste": "Baptiste zahlt den Wein zurück, bleibt aber Butler. Der neue Hausherr braucht ihn.",
 "lucian": "Lucian findet heraus, dass der Graf ihn und Rosalie zu Erben gemacht hat. Er spielt nie wieder Karten (er sagt es zumindest).",
 "morgana": "Morgana bekommt das Wohnrecht im Gästehaus und eine Rente. Es reicht für den Koffer, nicht für das Schloss.",
 "agatha": "Agatha schreibt ihren besten Roman: „Der Blutkelch“. Er wird ein Bestseller.",
 "lilith": "Lilith zahlt das Geld zurück und kündigt freiwillig. Ihr neuer Job: Buchhalterin im Sanatorium (neue Leitung).",
 "jack": "Jack und Rosalie heiraten im Kürbisgarten. Der Eisenhut wird umgepflanzt.",
 "rosalie": "Rosalie restauriert die Bilder auf Schloss Rabenstein, das jetzt ihr und ihrem Bruder gehört.",
 "pater": "Pater Ambrosius darf endlich reden und hält die Beerdigung für den Grafen und für Albrecht.",
 "dimitri": "Dimitri bekommt seinen Rubin zurück, der als Schmuckstein im Blutkelch saß. Die Fehde der Familien ist beendet.",
}
S.append(seite(kopf() + """
<h1>Epilog und Wahrheitstabelle</h1>
<h2>Epilog: zum Vorlesen</h2>
<div class="lesen">„Am Morgen fand Inspektor Grau in der Innentasche des Toten einen versiegelten Brief. Er war an Lucian und Rosalie gerichtet, die Kinder seines Bruders Albrecht: ‚Ich habe euch alles genommen, nun gebe ich euch alles zurück.‘ Das neue Testament des Grafen vermachte Schloss und Vermögen zu gleichen Teilen Albrechts Kindern. Gräfin Morgana erhält ein lebenslanges Wohnrecht im Gästehaus. Der Rubin im Blutkelch war übrigens der Blutrubin der Familie Vlad, den der Graf bei Mitternacht zurückgeben wollte. Und so endete die Nacht der Geister, so, wie sie es immer tut: mit einem Toten, einem Mörder und sehr viel weniger Geheimnissen als zuvor.“</div>
<h3>Was aus allen wurde (je eine Zeile)</h3>
<ul style="font-size:9.6pt">""" + "".join(f'<li><b>{R[i]["name"]}:</b> {epi[i]}</li>' for i in ["stein","zora","edgar","berta","baptiste","lucian","morgana","agatha","lilith","jack","rosalie","pater","dimitri"]) + """</ul>
<p class="klein">Lies nur die Zeilen der Rollen vor, die mitgespielt haben.</p>
"""))

truth = [
 ("stein", "Rittersaal (Anrichte) 21:05–21:12, Kaminzimmer 21:15–21:18, Halle 21:19", "Bei Zora im Kaminzimmer", "Zora, Lucian, Edgar, Berta, Morgana, Rosalie"),
 ("zora", "Kaminzimmer, allein", "Kaminzimmer (Tricks verschwiegen)", "Lucian bestätigt (21:06)"),
 ("edgar", "Terrasse, allein (Anwaltstelefonat)", "Terrasse, Telefonat mit Ehefrau", "Niemand; Lucian war nicht da"),
 ("berta", "Küche; ab 21:09 im Rittersaal (Zeugin)", "Nur in der Küche", "Steins Phiole, Handschuhe, Tablett-Klirren"),
 ("baptiste", "Kelch füllen, Arbeitszimmer, Rauchzimmer", "Wahrheit (ohne Weinhandel)", "Graf läutete 21:05"),
 ("lucian", "Streit bis 21:05, danach Weinkeller", "Terrasse", "Edgar widerlegt, Baptiste (Flasche fehlt)"),
 ("morgana", "Obergeschoss, Koffer packen", "Bibliothek", "Lilith widerlegt"),
 ("agatha", "Turmarchiv", "Salon, Notizen", "Mappe H7"),
 ("lilith", "Bibliothek, allein", "Bibliothek, Termine sortiert", "—"),
 ("jack", "Gewächshaus mit Rosalie", "allein im Gewächshaus", "Rosalie"),
 ("rosalie", "Gewächshaus mit Jack; Halle 21:19", "Bibliothek", "Lilith widerlegt, Jack bestätigt"),
 ("pater", "Krypta/Kapelle mit Dimitri", "Kapelle, Gebet", "Dimitri"),
 ("dimitri", "Krypta mit Pater", "Parkspaziergang", "Pater"),
]
S.append(seite(kopf("Wahrheitstabelle") + """
<h1>Wahrheitstabelle 21:00 bis 21:20 Uhr</h1>
<table class="schmal">
<tr><th style="width:17%">Rolle</th><th style="width:30%">Wahrheit</th><th style="width:22%">Behauptet</th><th>Wer bestätigt / widerlegt</th></tr>
""" + "".join(f'<tr><td><b>{R[i]["name"]}</b></td><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for i,a,b,c in truth) + """
</table>
<h2>Abstimmung und Auszeichnungen</h2>
<table class="schmal">
<tr><th style="width:36%">Kategorie</th><th>Wie man gewinnt</th></tr>
<tr><td>Meisterdetektiv:in</td><td>1 Punkt für den richtigen Täter, je 1 für Motiv, Methode und entscheidenden Beweis (max. 4).</td></tr>
<tr><td>Meisterlügner:in</td><td>Der Mörder gewinnt, wenn weniger als die Hälfte der Gäste ihn angeklagt hat.</td></tr>
<tr><td>Beste Darstellung</td><td>Geheime Wahl: Jeder schreibt auf die Rückseite des Stimmzettels einen Namen.</td></tr>
<tr><td>Bestes Kostüm</td><td>Applaus-Abstimmung.</td></tr>
<tr><td>Bester Zeuge</td><td>Wer in der Zeugenrunde das hilfreichste Detail geliefert hat (Spielleiter-Wahl).</td></tr>
</table>
<p class="klein">Preis-Ideen: Kürbis als Pokal, Gruselkerze, Fledermaus-Kekse, Süßigkeiten-Tüte „Gift“.</p>
"""))

# ---------------- Vorbereitung / Deko / Menü ----------------
S.append(seite(kopf() + """
<h1>Vorbereitung, Deko und Menü</h1>
<h2>Zeitplan für die Vorbereitung</h2>
<table class="schmal">
<tr><th style="width:20%">Wann</th><th>Was</th></tr>
<tr><td>3 Wochen vorher</td><td>Gäste einladen (Einladung drucken, Rolle und Kostüm eintragen), Termin festlegen.</td></tr>
<tr><td>2 Wochen vorher</td><td>Rollen verteilen. Wer den Mörder spielt, bestimmst du. Unterlagen drucken, Hinweiskarten ausschneiden, Menü planen.</td></tr>
<tr><td>1 Woche vorher</td><td>Optional: Rollenkarte per Foto oder Ausdruck vorab schicken, damit sich alle in die Rolle einlesen. Requisiten besorgen.</td></tr>
<tr><td>1 Tag vorher</td><td>Zutaten einkaufen, Suppe und Dessert vorbereiten, Tisch decken, Musik-Playlist testen.</td></tr>
<tr><td>3 Std. vorher</td><td>Hauptgang kochen, Deko aufhängen, Pokal füllen, Namensschilder und Umschläge bereitlegen.</td></tr>
</table>
<h2>Deko und Atmosphäre</h2>
<ul>
 <li><b>Tisch:</b> schwarze Tischdecke, Kerzenleuchter, kleine Kürbisse, Spinnenweben-Watte, Rabenfedern, Namensschilder und Menükarte.</li>
 <li><b>Räume:</b> Spinnennetze in den Ecken, LED-Kerzen, ein „Tatort“-Absperrband erst nach dem Mord (zeitgleich zur Inspektor-Szene).</li>
 <li><b>Licht:</b> warmes, gedimmtes Licht, möglichst wenig Deckenlicht. Für die Séance: Taschenlampe.</li>
 <li><b>Musik:</b> Orgel (Bach: Toccata und Fuge d-Moll), „Danse Macabre“ (Saint-Saëns), Filmmusik (Addams Family, Tim Burton), Gewitter-Effekte. Leise, damit man sich versteht.</li>
 <li><b>Kleine Gruselmomente:</b> Eiswürfel in Latexhandschuhen, Gummispinnen im Bowle-Eis (Vorsicht bei kleinen Kindern), Glibber-Augen.</li>
</ul>
<h2>Menü (Richtwerte für 13 Personen)</h2>
<table class="schmal">
<tr><th style="width:22%">Gang</th><th>Idee</th></tr>
<tr><td>Aperitif <i>Vampirkuss</i></td><td>Granatapfelsaft mit Sekt (alkoholfrei: mit Traubensaft und Soda). 2 l Saft, 2 Flaschen Sekt.</td></tr>
<tr><td>Vorspeise <i>Hexenkessel</i></td><td>Kürbiscremesuppe. 2 Hokkaido (ca. 1,8 kg), 3 Zwiebeln, 3 Kartoffeln, 1,2 l Brühe, 400 ml Kokosmilch oder Sahne, Ingwer, Curry. Sahne-Spinnennetz mit Zahnstocher ziehen.</td></tr>
<tr><td>Hauptgang <i>Das letzte Abendmahl</i></td><td>Hexengulasch. 2,2 kg Rind, 1,5 kg Zwiebeln, 4 Paprika, 3 EL Tomatenmark, 4 EL Paprikapulver, 1 l Brühe, ½ l Rotwein oder Brühe. Dazu Knochenbrötchen (Hefeteig, zu „Knochen“ geformt). Vegetarisch: Kürbis-Linsen-Eintopf mit roten Linsen und Kokosmilch.</td></tr>
<tr><td>Dessert <i>Friedhofserde &amp; Blutkelch</i></td><td>Schokopudding für 13 Personen, 2 Packungen Oreo-Keks zerbröselt, Gummiwürmer. Dazu Kirschgrütze im kleinen Glas (Sauerkirschen, Kirschsaft, Speisestärke).</td></tr>
<tr><td>Getränke</td><td><b>Blutkelch-Bowle:</b> 1 l Granatapfelsaft, 1 l Cranberrysaft, 0,5 l Ginger Ale, Orangenscheiben, Beeren (optional mit Rotwein oder Sekt). <b>Hexentrank:</b> Waldmeister- oder Limetten-Limonade. <b>Gespensterwasser:</b> Wasser mit Gurke und Minze.</td></tr>
</table>
<p class="klein">Frage bei der Einladung nach Allergien und vegetarischer Kost. Alkohol ist optional, das Spiel funktioniert auch komplett nüchtern.</p>
"""))

# ---------------- FAQ ----------------
S.append(seite(kopf() + """
<h1>Häufige Fragen und Notfallhilfe</h1>
<h2>Was, wenn die Gruppe den Mörder zu früh errät?</h2>
<p>Dann lobe sie, lass aber alle Rollen weiter ihre Geheimnisse klären, und gib in der Zeugenrunde noch H5, H6 und die Durchsuchung. Verlange von den Gästen <b>Beweise</b>: „Wer kann das belegen?“ Der Mörder darf sich auch dann verteidigen.</p>
<h2>Was, wenn niemand den Mörder findet?</h2>
<p>Nutze die Joker-Leiter (Seite „Phase 6 und 7“). Spätestens bei „Archiv!“ und der Durchsuchung sollte es klar werden. Wenn nicht: Du hast das Recht des Inspektors, am Ende laut zu sagen: „Meine Damen und Herren, ich schlage vor, wir sehen uns die Alibis noch einmal an …“ und die Wahrheitstabelle als Leitfaden zu verwenden.</p>
<h2>Was, wenn jemand sich für den Mörder hält?</h2>
<p>Das gehört dazu. Verdächtigungen sind erlaubt. Eine Anschuldigung ist kein Beweis, und jeder darf sich verteidigen, solange Fakten nicht geleugnet werden.</p>
<h2>Was, wenn ein Gast sehr schüchtern ist?</h2>
<p>Gib ihm eine Rolle mit konkreten Aufgaben: Baptiste (Zeitablauf) oder Agatha (Expertin). Frage: „Was haben Sie beobachtet?“ Das ist leichter als frei zu improvisieren.</p>
<h2>Was, wenn jemand das Spiel „kaputt“ macht?</h2>
<p>Rufe „Szenenwechsel“ und erinnere an die Regeln: Fakten sind unveränderlich, Geheimnisse dürfen verteidigt werden. Wenn ein Gast aus der Rolle fällt, nimm ihn kurz zur Seite.</p>
<h2>Können Kinder mitspielen?</h2>
<p>Der Fall ist gewaltfrei (Gift, keine Gewalt), aber die Themen (Tod, Betrug, Schuld) sind eher für Jugendliche und Erwachsene gedacht: empfohlen ab 16.</p>
<h2>Was, wenn ich selbst mitspielen will?</h2>
<p>Das geht, wenn du die Rolle des Inspektors an einen Gast abgibst oder die Rolle „Inspektor“ als stille Moderation spielst. Dann kennst du aber die Lösung. Alternativ: Bitte eine Person aus dem Freundeskreis, die Spielleitung zu übernehmen, und spiele nur eine <b>Nebenrolle</b> (z. B. Lilith), die nicht an der Lösung hängt.</p>
<h2>Checkliste am Spieltag</h2>
<ul style="columns:2; column-gap:14pt;">
 <li>☐ Rollenkarten in Umschlägen</li><li>☐ Namensschilder</li><li>☐ Hinweiskarten H1 bis H7</li><li>☐ Stimmzettel + Stifte</li>
 <li>☐ Pokal mit Saft</li><li>☐ Hut und Trenchcoat</li><li>☐ Braunes Fläschchen (H2)</li><li>☐ Taschenlampe / Kerzen</li>
 <li>☐ Musik und Effekte</li><li>☐ Menükarten</li><li>☐ Dessert vorbereitet</li><li>☐ Preise / Auszeichnungen</li>
</ul>
<p class="klein" style="margin-top:12pt">Viel Spaß bei der Nacht der Geister! 🎃🦇🕷️</p>
"""))

html = f'<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Krimidinner Spielleiter</title><style>{CSS}</style></head><body>{"".join(S)}</body></html>'
open('../Krimidinner_Spielleiter.html','w',encoding='utf-8').write(html)
print("SL sections:", len(S))
