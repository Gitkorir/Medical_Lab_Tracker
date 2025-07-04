from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..models.user import User

user_bp = Blueprint("user", __name__)

@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_users():
    users = User.query.all()
    result = [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]
    return jsonify(result), 200
