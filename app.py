from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/air80v2.html")
def air80v2():
    return render_template('air80v2.html', 
                         nominal_current=4.85,
                         nominal_vibration=2.8,
                         nominal_temperature=70,
                         nominal_isolation=1.22)

@app.route("/air200m8.html")
def air200m8():
    return render_template('air200m8.html',
                         nominal_current=39,
                         nominal_vibration=3.5,
                         nominal_temperature=70,
                         nominal_isolation=1.38)

if __name__ == '__main__':
    app.run(debug=True)