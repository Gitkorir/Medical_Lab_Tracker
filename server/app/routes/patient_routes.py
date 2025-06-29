from flask import Blueprint

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/test')
def test_patient():
    return {"msg": "Patient route working"}
