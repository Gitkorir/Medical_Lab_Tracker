from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.patient import Patient

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/', methods=['POST'])
@jwt_required()
def create_patient():
    data = request.get_json()
    name = data.get("name")
    dob = data.get("dob")
    gender = data.get("gender")

    if not all([name, dob, gender]):
        return jsonify({"msg": "Missing required fields"}), 400

    # Get the current logged-in user's ID
    user = get_jwt_identity()
    created_by = user["id"]

    patient = Patient(
        name=name,
        dob=dob,
        gender=gender,
        created_by=created_by
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify({
        "msg": "Patient created successfully",
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "dob": str(patient.dob),
            "gender": patient.gender,
            "created_by": patient.created_by
        }
    }), 201
# ✅ GET: List all patients for the logged-in user
@patient_bp.route('/', methods=['GET'])
@jwt_required()
def get_patients():
    user = get_jwt_identity()
    user_id = user["id"]

    patients = Patient.query.filter_by(created_by=user_id).all()
    result = []
    for p in patients:
        result.append({
            "id": p.id,
            "name": p.name,
            "dob": str(p.dob),
            "gender": p.gender,
            "created_by": p.created_by
        })

    return jsonify(result), 200

@patient_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    user = get_jwt_identity()
    user_id = user["id"]

    patient = Patient.query.filter_by(id=patient_id, created_by=user_id).first()

    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    return jsonify({
        "id": patient.id,
        "name": patient.name,
        "dob": str(patient.dob),
        "gender": patient.gender,
        "created_by": patient.created_by
    }), 200