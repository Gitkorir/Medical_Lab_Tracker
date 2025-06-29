from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.test_reference_range import TestReferenceRange
from ..extensions import db

reference_bp = Blueprint("reference_ranges", __name__)

# GET all
@reference_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_ranges():
    ranges = TestReferenceRange.query.all()
    return jsonify([
        {
            "id": r.id,
            "test_type": r.test_type,
            "parameter": r.parameter,
            "min_value": r.min_value,
            "max_value": r.max_value
         
        } for r in ranges
    ])

# POST
@reference_bp.route("/", methods=["POST"])
@jwt_required()
def create_range():
    data = request.get_json()
    r = TestReferenceRange(
        test_type=data["test_type"],
        parameter=data["parameter"],
        min_value=data.get("min_value"),
        max_value=data.get("max_value")
    )
    db.session.add(r)
    db.session.commit()
    return jsonify({"msg": "Created", "id": r.id}), 201

# PUT
@reference_bp.route("/<int:range_id>", methods=["PUT"])
@jwt_required()
def update_range(range_id):
    data = request.get_json()
    r = TestReferenceRange.query.get_or_404(range_id)
    r.test_type = data.get("test_type", r.test_type)
    r.parameter = data.get("parameter", r.parameter)
    r.min_value = data.get("min_value", r.min_value)
    r.max_value = data.get("max_value", r.max_value)
    db.session.commit()
    return jsonify({"msg": "Updated"})

# DELETE
@reference_bp.route("/<int:range_id>", methods=["DELETE"])
@jwt_required()
def delete_range(range_id):
    r = TestReferenceRange.query.get_or_404(range_id)
    db.session.delete(r)
    db.session.commit()
    return jsonify({"msg": "Deleted"})


__all__ = ['reference_bp']
