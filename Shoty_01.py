from flask import Flask, render_template, request, redirect, url_for, session
import random
import json
from players import Player  

app = Flask(__name__)
app.secret_key = 'geheim'  # Für Sessiondaten

@app.route('/', methods=['GET', 'POST'])
def index():
    # Startseite: Spieleranzahl abfragen oder Namen eingeben
    if request.method == 'POST':
        spieler_anzahl = int(request.form['spieler_anzahl'])
        return render_template('index.html', spieler_anzahl=spieler_anzahl)
    return render_template('index.html')

@app.route('/spiel_starten', methods=['POST'])
def spiel_starten():
    # Namen der Spieler aus dem Formular holen
    spieler_namen = request.form.getlist('spieler_name')
    if len(set(spieler_namen)) != len(spieler_namen):
        return "Fehler: Doppelte Spielernamen!"

    # Spielerobjekte erstellen
    spieler_liste = [Player(name).to_dict() for name in spieler_namen]

    # Spielfeld initialisieren: 25 normale Felder (0), 5 Löcher (1), gemischt
    session["spieler"] = spieler_liste
    session['felder'] = [0] * 25 + [1] * 5
    random.shuffle(session['felder'])
    session['aktueller_spieler'] = 0

    return redirect(url_for('spiel'))

@app.route('/spiel')
def spiel():
    # Spieler und Felder aus der Session holen
    spieler = [Player.from_dict(p) for p in session['spieler']]
    felder = session['felder']
    aktueller_spieler_idx = session['aktueller_spieler']

    aktueller_spieler = spieler[aktueller_spieler_idx]
    karte = random.randint(1, 5)  # Karte ziehen (1-5)
    karotten_feld = ""

    # Karten-Logik
    if karte in [1, 2, 3]:
        aktueller_spieler.move(karte)
        karotten_feld = check_position(aktueller_spieler.position)
        # Wenn Loch: zurück auf Start
        if karotten_feld == "Du bist in ein Loch geflogen! Sauf!":
            aktueller_spieler.position = 0
    elif karte == 4:
        random.shuffle(felder)  # Felder neu mischen
        karotten_feld = check_position(aktueller_spieler.position)

    # Bilddatei für gezogene Karte
    gezogene_karte = f"karte_{karte}.png"

    # Session aktualisieren
    session['spieler'] = [p.to_dict() for p in spieler]
    session['felder'] = felder
    session['aktueller_spieler'] = (aktueller_spieler_idx + 1) % len(spieler)

    # Namen und Positionen für das Frontend
    spieler_namen = [p.name for p in spieler]
    counter = [p.position for p in spieler]

    # Spielfeld, Spieler und Felder an das Template übergeben
    return render_template('spiel.html',
                           spieler_namen=spieler_namen,
                           counter=counter,
                           karotten_feld=karotten_feld,
                           aktueller=spieler_namen[aktueller_spieler_idx],
                           gezogene_karte=gezogene_karte,
                           zip=zip,
                           spieler_json=json.dumps([p.to_dict() for p in spieler]),
                           felder=felder)  # Felder für das Frontend

def check_position(position):
    # Prüft, ob das aktuelle Feld ein Loch ist oder das Ziel erreicht wurde
    felder = session['felder']
    if position >= len(felder):
        return "Du hast das Spiel gewonnen!"
    if position < len(felder) and felder[position] == 1:
        return "Du bist in ein Loch geflogen! Sauf!"
    else:  
        return ""
    
if __name__ == '__main__':
    app.run(debug=True)
