from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta
import logging

from ..extensions import db
from ..models.user import User

auth_bp = Blueprint("auth", __name__)

# Set up logging for better debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register User
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    logger.info(f"Register endpoint called with data: {data}")

    required_fields = ["name", "email", "password"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"msg": f"Missing fields: {', '.join(missing_fields)}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"msg": "Email already registered"}), 400

    hashed_password = generate_password_hash(data["password"])
    role = data.get("role", "user")

    new_user = User(
        name=data["name"],
        email=data["email"],
        password=hashed_password,
        role=role,
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# Login User
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    logger.info(f"Login endpoint called with data: {data}")

    if "email" not in data or "password" not in data:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity={"id": user.id, "email": user.email, "role": user.role},
        expires_delta=timedelta(hours=1),
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,  
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
    }), 200