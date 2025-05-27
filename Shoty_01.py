from flask import Flask, render_template, request, redirect, url_for, session
import random

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

    session['spieler_namen'] = spieler_namen
    session['counter'] = [0] * len(spieler_namen)
    session['felder'] = [0] * 22 + [1] * 8
    random.shuffle(session['felder'])
    session['aktueller_spieler'] = 0

    return redirect(url_for('spiel'))

@app.route('/spiel')
def spiel():
    spieler_namen = session['spieler_namen']
    counter = session['counter']
    felder = session['felder']
    aktueller_spieler = session['aktueller_spieler']

    karte = random.randint(1, 5)
    meldung = ""

    if karte == 1:
        counter[aktueller_spieler] += 1
        meldung = 'Du hast eine 1 geworfen!'
    elif karte == 2:
        counter[aktueller_spieler] += 2
        meldung = 'Du hast eine 2 geworfen!'
    elif karte == 3:
        counter[aktueller_spieler] += 3
        meldung = 'Du hast eine 3 geworfen!'
    elif karte == 4:
        random.shuffle(felder)
        meldung = 'Du hast eine 4 geworfen!'
    elif karte == 5:
        meldung = 'Shoty! Du hast eine 5 geworfen!'

    session['counter'] = counter
    session['felder'] = felder
    aktueller_spieler = (aktueller_spieler + 1) % len(spieler_namen)
    session['aktueller_spieler'] = aktueller_spieler

    return render_template('spiel.html',
                           spieler_namen=spieler_namen,
                           counter=counter,
                           meldung=meldung,
                           aktueller=spieler_namen[aktueller_spieler])

if __name__ == '__main__':
    app.run(debug=True)
