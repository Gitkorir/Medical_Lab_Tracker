from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.patient import Patient
from ..models.lab_test import LabTest

patient_bp = Blueprint("patient", __name__)

# GET: List patients (optionally filtered by user), with test/abnormal counts
@patient_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_patients():
    try:
        current_user = get_jwt_identity()
        if current_user:
            user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
            patients = Patient.query.filter_by(created_by=user_id).all()
        else:
            patients = Patient.query.all()

        result = []
        for p in patients:
            tests = LabTest.query.filter_by(patient_id=p.id).all()
            abnormal_count = sum(1 for t in tests if getattr(t, "flagged", False))
            result.append({
                "id": p.id,
                "name": p.name,
                "dob": str(p.dob),
                "gender": p.gender,
                "created_by": getattr(p, "created_by", None),
                "test_count": len(tests),
                "abnormal_count": abnormal_count,
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Get patients error: {str(e)}")
        return jsonify({"error": "Failed to fetch patients"}), 500

# POST: Create new patient
@patient_bp.route("/", methods=["POST"])
@jwt_required(optional=True)
def create_patient():
    try:
        data = request.get_json() or {}
        name = data.get("name")
        dob = data.get("dob")
        gender = data.get("gender")

        if not all([name, dob, gender]):
            return jsonify({"error": "Missing required fields: name, dob, gender"}), 400

        current_user = get_jwt_identity()
        created_by = current_user.get("id") if isinstance(current_user, dict) else current_user

        patient = Patient(
            name=name,
            dob=dob,
            gender=gender,
            created_by=created_by
        )

        db.session.add(patient)
        db.session.commit()

        return jsonify({
            "message": "Patient created successfully",
            "data": {
                "id": patient.id,
                "name": patient.name,
                "dob": str(patient.dob),
                "gender": patient.gender,
                "created_by": patient.created_by
            }
        }), 201

    except Exception as e:
        print(f"Create patient error: {str(e)}")
        return jsonify({"error": "Failed to create patient"}), 500

# GET: One patient by ID, with test/abnormal counts
@patient_bp.route("/<int:patient_id>", methods=["GET"])
@jwt_required()
def get_patient(patient_id):
    user = get_jwt_identity()
    user_id = user.get("id") if isinstance(user, dict) else user

    patient = Patient.query.filter_by(id=patient_id, created_by=user_id).first()

    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    tests = LabTest.query.filter_by(patient_id=patient.id).all()
    abnormal_count = sum(1 for t in tests if getattr(t, "flagged", False))

    return jsonify({
        "id": patient.id,
        "name": patient.name,
        "dob": str(patient.dob),
        "gender": patient.gender,
        "created_by": patient.created_by,
        "test_count": len(tests),
        "abnormal_count": abnormal_count
    }), 200

# PUT: Update a patient
@patient_bp.route("/<int:patient_id>", methods=["PUT"])
@jwt_required()
def update_patient(patient_id):
    current_user = get_jwt_identity()
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
    data = request.get_json() or {}

    patient = Patient.query.filter_by(id=patient_id, created_by=user_id).first()
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    patient.name = data.get("name", patient.name)
    patient.dob = data.get("dob", patient.dob)
    patient.gender = data.get("gender", patient.gender)

    db.session.commit()

    return jsonify({
        "msg": "Patient updated successfully",
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "dob": str(patient.dob),
            "gender": patient.gender
        }
    }), 200

# DELETE: Remove a patient
@patient_bp.route("/<int:patient_id>", methods=["DELETE"])
@jwt_required()
def delete_patient(patient_id):
    current_user = get_jwt_identity()
    user_id = current_user.get("id") if isinstance(current_user, dict) else current_user

    patient = Patient.query.filter_by(id=patient_id, created_by=user_id).first()
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    db.session.delete(patient)
    db.session.commit()

    return jsonify({"msg": f"Patient '{patient.name}' deleted successfully."}), 200

# Optional test route
@patient_bp.route("/test", methods=["GET"])
def test_patients():
    return jsonify({"message": "Patients endpoint is working!", "status": "ok"})