from flask import Flask, render_template, request, redirect, url_for, session
import random
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
    session['felder'] = [0] * 22 + [1] * 8
    random.shuffle(session['felder'])
    session['aktueller_spieler'] = 0

    return redirect(url_for('spiel'))

@app.route('/spiel')
def spiel():
    spieler_dicts = session['spieler']
    spieler = [Player.from_dict(p) for p in session['spieler']]
    felder = session['felder']
    aktueller_spieler_idx = session['aktueller_spieler']

    aktueller_spieler = spieler[aktueller_spieler_idx]
    karte = random.randint(1, 5)
    meldung = ""

    if karte in [1, 2, 3]:
        aktueller_spieler.move(karte)
        meldung = f'Du hast eine {karte} gezogen!'
    elif karte == 4:
        random.shuffle(felder)
        meldung = 'Du hast eine Karotte gezogen!'
    elif karte == 5:
        meldung = 'Shoty!'

    # 🎴 Mapping zur Bilddatei
    gezogene_karte = f"karte_{karte}.png"

    session['spieler'] = [p.to_dict() for p in spieler]
    session['felder'] = felder
    session['aktueller_spieler'] = (aktueller_spieler_idx + 1) % len(spieler)

    spieler_namen = [p.name for p in spieler]
    counter = [p.position for p in spieler]

    return render_template('spiel.html',
                           spieler_namen=spieler_namen,
                           counter=counter,
                           meldung=meldung,
                           aktueller=spieler_namen[aktueller_spieler_idx],
                           gezogene_karte=gezogene_karte,
                           zip=zip)

if __name__ == '__main__':
    app.run(debug=True)
