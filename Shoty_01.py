from flask import Flask
import random

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hallo, willkommen beim Flask Server!'


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

    