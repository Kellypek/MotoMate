from flask import Flask, jsonify

from database import initialize_database
from routes.motorcycles import motorcycle_bp
from routes.maintenance import maintenance_bp
from flask_cors import CORS


app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ]
    }
})

from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
app.config["DATABASE_PATH"] = str(
    BACKEND_DIR / "data" / "motomate.db"
)

@app.get("/")
def home():
    return """
    <h1>MotoMate</h1>
    <p>Your Motorcycle Maintenance Mate</p>
    <p>Manage your motorcycles and maintenance records.</p>
    """

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
    app.run()