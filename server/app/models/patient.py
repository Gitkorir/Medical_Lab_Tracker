from ..extensions import db

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    lab_tests = db.relationship('LabTest', backref='patient', lazy=True)
