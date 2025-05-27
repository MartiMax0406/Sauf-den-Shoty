from flask import Flask
import random

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hallo, willkommen beim Flask Server!'

def spiel_starten():
    spieler_anzahl = int(input('Gib die Anzahl der Spieler ein: '))
    if spieler_anzahl < 2:
        print('Es müssen mindestens 2 Spieler teilnehmen.')
        return
    spieler_namen = {}

    for i in range(spieler_anzahl):
        name = input('Gib den Namen des Spielers ein:')
        if name in spieler_namen:
            print(f'{name} ist bereits im Spiel.')
            i =- 1
        else:
            spieler_namen[i] = name
            print(f'{name} wurde zum Spiel hinzugefügt.')


def runde(aktueller_spieler):
    karte = random.randint(1, 5)
    if karte == 1:
        return 'Du hast eine 1 geworfen!'
    elif karte == 2:
        return 'Du hast eine 2 geworfen!'
    elif karte == 3:
        return 'Du hast eine 3 geworfen!'
    elif karte == 4:
        return 'Du hast eine 4 geworfen!'
    elif karte == 5:
        return 'Du hast eine 5 geworfen!'
if __name__ == '__main__':
    app.run(debug=True)

    