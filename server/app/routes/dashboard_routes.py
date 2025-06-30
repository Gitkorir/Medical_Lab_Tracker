from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Patient, LabTest

dashboard_bp = Blueprint('dashboard', __name__)

# ✅ FIXED: Remove duplicate /dashboard from route
@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required(optional=True)  # Make JWT optional for testing
def get_summary():
    try:
        # Get current user if authenticated
        current_user = get_jwt_identity()
        
        if current_user:
            # Filter by user if authenticated
            user_id = current_user.get("id") if isinstance(current_user, dict) else current_user
            patient_count = db.session.query(Patient).filter_by(created_by=user_id).count()
            test_count = db.session.query(LabTest).filter(LabTest.patient.has(created_by=user_id)).count()
            abnormal_count = db.session.query(LabTest).filter(
                LabTest.flagged == True,
                LabTest.patient.has(created_by=user_id)
            ).count()
        else:
            # Return all if not authenticated (for testing)
            patient_count = db.session.query(Patient).count()
            test_count = db.session.query(LabTest).count()
            abnormal_count = db.session.query(LabTest).filter(LabTest.flagged == True).count()

        return jsonify({
            "patientCount": patient_count,
            "testCount": test_count,
            "abnormalCount": abnormal_count,
            "authenticated": current_user is not None
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")  # For debugging
        return jsonify({"error": "Failed to fetch dashboard data"}), 500

# ✅ ADD: Test endpoint without authentication
@dashboard_bp.route('/test', methods=['GET'])
def test_dashboard():
    return jsonify({"message": "Dashboard endpoint is working!", "status": "ok"}), 200