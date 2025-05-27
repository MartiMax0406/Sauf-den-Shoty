from flask import Flask, render_template, request, redirect, url_for, session
import random

app = Flask(__name__)
app.secret_key = 'geheim'  # Für Sessiondaten

# ⬇️ Spiellogik als eigene Funktion
def runde():
    spieler_namen = session['spieler_namen']
    counter = session['counter']
    felder = session['felder']
    aktueller_spieler = session['aktueller_spieler']

    karte = random.randint(1, 5)
    meldung = ""
    gezogene_karte = "rueckseite.png"

    if karte == 1:
        counter[aktueller_spieler] += 1
        meldung = 'Du hast eine 1 gezogen!'
        gezogene_karte = 'karte_1.png'
    elif karte == 2:
        counter[aktueller_spieler] += 2
        meldung = 'Du hast eine 2 gezogen!'
        gezogene_karte = 'karte_2.png'
    elif karte == 3:
        counter[aktueller_spieler] += 3
        meldung = 'Du hast eine 3 gezogen!'
        gezogene_karte = 'karte_3.png'
    elif karte == 4:
        random.shuffle(felder)
        meldung = 'Felder neu gemischt!'
        gezogene_karte = 'karte_4.png'
    elif karte == 5:
        meldung = 'Shoty! Du hast eine 5 gezogen!'
        gezogene_karte = 'karte_5.png'

    # Update Session-Daten
    session['counter'] = counter
    session['felder'] = felder
    session['gezogene_karte'] = gezogene_karte
    session['meldung'] = meldung

    # Spielerwechsel
    session['aktueller_spieler'] = (aktueller_spieler + 1) % len(spieler_namen)


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

    session['spieler_namen'] = spieler_namen
    session['counter'] = [0] * len(spieler_namen)
    session['felder'] = [0] * 22 + [1] * 8
    random.shuffle(session['felder'])
    session['aktueller_spieler'] = 0
    session['gezogene_karte'] = 'rueckseite.png'
    session['meldung'] = ''

    return redirect(url_for('spiel'))


@app.route('/spiel')
def spiel():
    runde()  # ⬅️ Spiellogik aufrufen

    return render_template('spiel.html',
                           spieler_namen=session['spieler_namen'],
                           counter=session['counter'],
                           meldung=session['meldung'],
                           aktueller=session['spieler_namen'][session['aktueller_spieler']],
                           gezogene_karte=session['gezogene_karte'],
                           zip=zip)


if __name__ == '__main__':
    app.run(debug=True)
