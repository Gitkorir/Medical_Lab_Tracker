# server/app/routes/lab_test_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..extensions import db
from ..models.lab_test import LabTest
from ..models.patient import Patient
from ..services.flagging import flag_abnormal
from datetime import datetime # Import datetime for isoformat if needed

lab_test_bp = Blueprint("lab_test", __name__)

@lab_test_bp.route("/<int:patient_id>", methods=["GET"])
@jwt_required()
def get_tests_for_patient(patient_id):
    tests = LabTest.query.filter_by(patient_id=patient_id).all()
    results = [
        {
            "id": t.id,
            "parameter": t.parameter,
            "result_values": t.result_values,  # FIX 1: Changed 'values' to 'result_values'
            "flagged": t.flagged,
            "date_conducted": t.date_conducted.isoformat() if t.date_conducted else None, # FIX 2: Changed 'date' to 'date_conducted' and added .isoformat()
        }
        for t in tests
    ]
    return jsonify(results), 200

@lab_test_bp.route("", methods=["POST"])
@jwt_required()
def create_test():
    data = request.get_json() or {}
    parameter = data.get("parameter")
    values = data.get("result_values")  # Should be a dict
    patient_id = data.get("patient_id")

    if not all([parameter, values, patient_id]):
        return jsonify({"msg": "Missing required fields"}), 400

    patient = Patient.query.filter_by(id=patient_id).first()
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    # Flag abnormal results
    # Ensure 'values' is a dictionary with 'value' and 'unit' keys
    if not isinstance(values, dict) or 'value' not in values or 'unit' not in values:
        return jsonify({"msg": "result_values must be a dictionary with 'value' and 'unit'"}), 400

    is_flagged = flag_abnormal(parameter, values)

    test = LabTest(
        parameter=parameter,
        result_values=values,
        patient_id=patient_id,
        flagged=is_flagged,
    )

    db.session.add(test)
    db.session.commit()

    # Return the newly created test data, including its ID and formatted date
    return jsonify({
        "msg": "Test recorded",
        "flagged": is_flagged,
        "test": { # Return the full test object for frontend to update state
            "id": test.id,
            "parameter": test.parameter,
            "result_values": test.result_values,
            "flagged": test.flagged,
            "date_conducted": test.date_conducted.isoformat() if test.date_conducted else None,
            "patient_id": test.patient_id
        }
    }), 201

@lab_test_bp.route("", methods=["GET"])
@jwt_required()
def get_all_tests():
    tests = LabTest.query.order_by(LabTest.id.desc()).all()
    results = []
    for t in tests:
        patient = Patient.query.get(t.patient_id)
        results.append({
            "id": t.id,
            "parameter": t.parameter,
            "result_values": t.result_values,
            "flagged": t.flagged,
            "date_conducted": t.date_conducted.isoformat() if t.date_conducted else None, # Also format here
            "patient_id": t.patient_id,
            "patient_name": patient.name if patient else "",
        })
    return jsonify(results), 200