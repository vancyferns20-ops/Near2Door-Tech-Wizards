from flask import Flask
from flask_cors import CORS
from .routes import bp as routes_bp

def create_app():
    app = Flask(__name__)
    allowed_origins = [
        "https://near2-door-tech-wizards.vercel.app",
        "https://didactic-parakeet-jxv5j6j96672p4jx-5173.app.github.dev",
        "https://didactic-parakeet-jxv5j6j96672p4jx-5000.app.github.dev",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
    ]
    CORS(app, origins=allowed_origins)
    app.register_blueprint(routes_bp)

    return app