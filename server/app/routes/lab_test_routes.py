from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.lab_test import LabTest
from ..models.patient import Patient
from ..services.flagging import flag_abnormal

lab_test_bp = Blueprint('lab_test', __name__)

@lab_test_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_tests_for_patient(patient_id):
    tests = LabTest.query.filter_by(patient_id=patient_id).all()
    results = [
        {
            "id": t.id,
            "parameter": t.parameter,
            "values": t.result_values,
            "flagged": t.flagged,
            "date": t.date_conducted
        } for t in tests
    ]
    return jsonify(results), 200

@lab_test_bp.route('/', methods=['POST'])
@jwt_required()
def create_test():
    data = request.get_json()
    parameter = data.get('parameter')
    values = data.get('result_values')  # Should be a dict
    patient_id = data.get('patient_id')

    if not all([parameter, values, patient_id]):
        return jsonify({"msg": "Missing required fields"}), 400

    # Ensure patient exists and get created_by for dashboard tracking
    patient = Patient.query.filter_by(id=patient_id).first()
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404

    # Flag it
    is_flagged = flag_abnormal(parameter, values)

    test = LabTest(
        parameter=parameter,
        result_values=values,
        patient_id=patient_id,
        flagged=is_flagged
    )

    db.session.add(test)
    db.session.commit()

    return jsonify({
        "msg": "Test recorded",
        "flagged": is_flagged
    }), 201