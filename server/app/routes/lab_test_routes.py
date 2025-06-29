from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.lab_test import LabTest
from ..models.patient import Patient
from ..services.flagging import flag_abnormal

lab_test_bp = Blueprint('lab_test', __name__)

@lab_test_bp.route('/', methods=['POST'])
@jwt_required()
def create_test():
    data = request.get_json()
    
    test_type = data.get('test_type')
    values = data.get('result_values')  # Should be a dict
    patient_id = data.get('patient_id')

    if not all([test_type, values, patient_id]):
        return jsonify({"msg": "Missing required fields"}), 400

    # Flag it
    is_flagged = flag_abnormal(test_type, values)

    test = LabTest(
        test_type=test_type,
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
