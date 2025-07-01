from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.patient import Patient
from ..models.lab_test import LabTest

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required(optional=True)
def get_summary():
    try:
        current_user = get_jwt_identity()
        if current_user:
            user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
            patient_count = Patient.query.filter_by(created_by=user_id).count()
            test_count = LabTest.query.join(Patient).filter(Patient.created_by == user_id).count()
            abnormal_count = LabTest.query.join(Patient).filter(
                Patient.created_by == user_id,
                LabTest.flagged == True
            ).count()
        else:
            patient_count = Patient.query.count()
            test_count = LabTest.query.count()
            abnormal_count = LabTest.query.filter_by(flagged=True).count()

        return jsonify({
            "patientCount": patient_count,
            "testCount": test_count,
            "abnormalCount": abnormal_count,
            "authenticated": current_user is not None
        }), 200

    except Exception as e:
        print(f"Dashboard error: {str(e)}")  # For debugging
        return jsonify({"error": "Failed to fetch dashboard data"}), 500