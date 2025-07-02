from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, jwt
from .models import *  # Ensures models are imported during migration
from .routes import register_routes
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS configuration
    CORS(
        app,
        origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://medical-lab-tracker.netlify.app",
        ],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Range", "X-Content-Range"],
    )

    # Register blueprints/routes
    register_routes(app)

    # Root endpoint - health check
    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "Medical Lab Tracker API root"}), 200

    return app