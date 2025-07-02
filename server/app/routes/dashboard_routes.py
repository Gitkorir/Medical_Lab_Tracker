from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..extensions import db
from ..models import Patient, LabTest

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required(optional=True)
def get_summary():
    try:
        patient_count = db.session.query(Patient).count()
        test_count = db.session.query(LabTest).count()
        abnormal_count = db.session.query(LabTest).filter(LabTest.flagged.is_(True)).count()
        return jsonify({
            "patientCount": patient_count,
            "testCount": test_count,
            "abnormalCount": abnormal_count,
        }), 200
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return jsonify({"error": "Failed to fetch dashboard data"}), 500