from flask import Flask
import random

app = Flask(__name__)

@app.route('/')
def home():
    spiel_starten()

def spiel_starten():
    spieler_anzahl = int(input('Gib die Anzahl der Spieler ein: '))
    if spieler_anzahl < 2:
        print('Es müssen mindestens 2 Spieler teilnehmen.')
        return
    spieler_namen = []
    for i in range(spieler_anzahl):
        name = input('Gib den Namen des Spielers ein: ')
        if name in spieler_namen:
            print(f'{name} ist bereits im Spiel.')
            i = i - 1
        else:
            spieler_namen[i] = name
            print(f'{name} wurde zum Spiel hinzugefügt.')
    # Starte das Spiel
    global counter
    global felder
    counter = [0] * spieler_anzahl 
    felder = [0] * 22 + [1] * 8
    random.shuffle(felder)
    runde(spieler_anzahl, aktueller_spieler=0)

def runde(spieler_anzahl, aktueller_spieler):
    # Karte ziehen
    karte = random.randint(1, 5)
    if karte == 1:
        counter[aktueller_spieler] += 1
        return 'Du hast eine 1 geworfen!'
    elif karte == 2:
        counter[aktueller_spieler] += 2
        return 'Du hast eine 2 geworfen!'
    elif karte == 3:
        counter[aktueller_spieler] += 3
        return 'Du hast eine 3 geworfen!'
    elif karte == 4:
        random.shuffle(felder)
        return 'Du hast eine 4 geworfen!'
    elif karte == 5:
        print("Shoty!")
        return 'Du hast eine 5 geworfen!'
    
    # Wechsle zum nächsten Spieler
    if aktueller_spieler < spieler_anzahl - 1:
        aktueller_spieler += 1
    else:
        aktueller_spieler = 0

if __name__ == '__main__':
    app.run(debug=True)

    