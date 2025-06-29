from ..extensions import db
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime

class LabTest(db.Model):
    __tablename__ = 'lab_tests'

    id = db.Column(db.Integer, primary_key=True)
    test_type = db.Column(db.String(50), nullable=False)
    result_values = db.Column(JSON, nullable=False)
    date_conducted = db.Column(db.DateTime, default=datetime.utcnow)
    flagged = db.Column(db.Boolean, default=False)

    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'))
