from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hallo, willkommen beim Flask Server!'

if __name__ == '__main__':
    app.run(debug=True)

    