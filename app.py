from flask import Flask, jsonify

from database import initialize_database
from routes.motorcycles import motorcycle_bp
from routes.maintenance import maintenance_bp


app = Flask(__name__)

initialize_database()

app.register_blueprint(motorcycle_bp)
app.register_blueprint(maintenance_bp)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "MotoMate"
    }


if __name__ == "__main__":
    app.run(debug=True)