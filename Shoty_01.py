from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import random
import json
from players import Player  

app = Flask(__name__)
app.secret_key = 'geheim'  # Für Sessiondaten

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        spieler_anzahl = int(request.form['spieler_anzahl'])
        return render_template('index.html', spieler_anzahl=spieler_anzahl)

    return render_template('index.html')

@app.route('/spiel_starten', methods=['POST'])
def spiel_starten():
    spieler_namen = request.form.getlist('spieler_name')
    if len(set(spieler_namen)) != len(spieler_namen):
        return "Fehler: Doppelte Spielernamen!"

    # Spielerobjekte erstellen
    spieler_liste = [Player(name).to_dict() for name in spieler_namen]

    session["spieler"] = spieler_liste
    session['felder'] = [0] * 25 + [1] * 5
    random.shuffle(session['felder'])
    session['aktueller_spieler'] = 0

    return redirect(url_for('spiel'))

@app.route('/spiel')
def spiel():
    spieler = [Player.from_dict(p) for p in session['spieler']]
    aktueller_spieler_idx = session['aktueller_spieler']

    # Nachricht aus dem letzten Zug anzeigen, dann entfernen
    karotten_feld = session.pop('karotten_feld', '')

    # Karte nur ziehen, wenn noch keine für diesen Zug existiert
    karte = session.get('gezogene_karte')
    if karte is None:
        karte = random.randint(1, 5)
        session['gezogene_karte'] = karte

    # 🎴 Bilddatei der gezogenen Karte
    gezogene_karte = f"karte_{karte}.png"

    spieler_namen = [p.name for p in spieler]
    counter = [p.position for p in spieler]

    return render_template('spiel.html',
                           spieler_namen=spieler_namen,
                           counter=counter,
                           karotten_feld=karotten_feld,
                           aktueller=spieler_namen[aktueller_spieler_idx],
                           gezogene_karte=gezogene_karte,
                           zip=zip,
                           spieler_json=json.dumps([p.to_dict() for p in spieler]))

@app.route('/apply_card')
def apply_card():
    spieler = [Player.from_dict(p) for p in session['spieler']]
    felder = session['felder']
    aktueller_spieler_idx = session['aktueller_spieler']

    karte = session.pop('gezogene_karte', None)
    if karte is None:
        return redirect(url_for('spiel'))

    aktueller_spieler = spieler[aktueller_spieler_idx]
    karotten_feld = ""

    if karte in [1, 2, 3]:
        aktueller_spieler.move(karte)
        karotten_feld = check_position(aktueller_spieler.position)
        if karotten_feld == "Du bist in ein Loch geflogen! Sauf!":
            aktueller_spieler.position = 0

    elif karte == 4:
        random.shuffle(felder)
        karotten_feld = check_position(aktueller_spieler.position)

    session['spieler'] = [p.to_dict() for p in spieler]
    session['felder'] = felder
    session['aktueller_spieler'] = (aktueller_spieler_idx + 1) % len(spieler)
    session['karotten_feld'] = karotten_feld

    if request.args.get('ajax') == '1':
        next_idx = session['aktueller_spieler']
        next_name = spieler[next_idx].name
        return jsonify({
            'spieler': session['spieler'],
            'aktueller': next_name,
            'karotten_feld': karotten_feld
        })

    return redirect(url_for('spiel'))


def check_position(position):
    felder = session['felder']
    if position >= len(felder):
        return "Du hast das Spiel gewonnen!"
    if position < len(felder) and felder[position] == 1:
        return "Du bist in ein Loch geflogen! Sauf!"
    else:  
        return ""
    

if __name__ == '__main__':
    app.run(debug=True)
