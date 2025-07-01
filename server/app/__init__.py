from flask import Flask, request, make_response, jsonify
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
    with app.app_context():
     db.create_all()
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ✅ Proper CORS configuration
    CORS(
        app,
        origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://medical-lab-tracker.netlify.app",   # add your Netlify frontend!
        ],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Content-Range", "X-Content-Range"]
    )

    # Register all routes (including API blueprints)
    register_routes(app)

    # ✅ Friendly root endpoint for health/status (avoids 404 on '/')
    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "Medical Lab Tracker API root"}), 200

    # ✅ Handle preflight requests (CORS)
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
       

    return app