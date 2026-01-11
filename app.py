from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/air80v2.html")
def air80v2():
    return render_template('air80v2.html')

@app.route("/air200m8.html")
def air200m8():
    return render_template('air200m8.html')

if __name__ == '__main__':
    app.run(debug=True)