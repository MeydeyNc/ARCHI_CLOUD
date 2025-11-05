from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def hello():
    return jsonify({'message':'bonsoir'})

@app.route('/kenobi', methods=['GET'])
def kenobi():
    return jsonify({'message':'hello there'})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
