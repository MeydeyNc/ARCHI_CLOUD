# hello.py

from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/kenobi")
def kenobi():
    return jsonify({'message':'Hello there'})
