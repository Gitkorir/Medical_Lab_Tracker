from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash,check_password_hash

db=SQLAlchemy()


class Patient(db.Model):
    __tablename__ = "patients"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    medical_id = db.Column(db.String(50), unique=True)
    samples = db.relationship("Sample", backref="patient", lazy=True)

class Sample(db.Model):
    __tablename__ = "samples"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"))
    technician_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    collection_date = db.Column(db.Date)
    sample_type = db.Column(db.String(50))  # e.g., "Blood", "Saliva"
    tests = db.relationship("Test", backref="sample", lazy=True)
    reviews = db.relationship("ReviewLog", backref="sample", lazy=True)

class Test(db.Model):
    __tablename__ = "tests"
    id = db.Column(db.Integer, primary_key=True)
    sample_id = db.Column(db.Integer, db.ForeignKey("samples.id"))
    test_name = db.Column(db.String(50))  # e.g., "Glucose", "WBC Count"
    test_value = db.Column(db.Float)
    units = db.Column(db.String(10))  # e.g., "mg/dL", "x10^9/L"
    test_date = db.Column(db.Date)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.String(20))  # "lab_tech", "doctor", "admin"
    password_hash = db.Column(db.String(128))
    samples_processed = db.relationship("Sample", backref="technician", lazy=True)
    reviews = db.relationship("ReviewLog", backref="reviewer", lazy=True)

class ReviewLog(db.Model):
    __tablename__ = "review_logs"
    id = db.Column(db.Integer, primary_key=True)
    sample_id = db.Column(db.Integer, db.ForeignKey("samples.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    notes = db.Column(db.Text)
    reviewed_at = db.Column(db.DateTime, default=db.func.now())