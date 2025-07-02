from ..extensions import db
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime

class LabTest(db.Model):
    __tablename__ = "lab_tests"

    id = db.Column(db.Integer, primary_key=True)
    parameter = db.Column(db.String(100), nullable=False, default="Pending")
    result_values = db.Column(JSON, nullable=False)
    date_conducted = db.Column(db.DateTime, default=datetime.utcnow)
    flagged = db.Column(db.Boolean, default=False)

    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)

    # Optional: for bidirectional relationship if needed in Patient
    # patient = db.relationship("Patient", back_populates="lab_tests")