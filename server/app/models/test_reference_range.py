from ..extensions import db

class TestReferenceRange(db.Model):
    __tablename__ = "test_reference_ranges"

    id = db.Column(db.Integer, primary_key=True)
    parameter = db.Column(db.String(100), nullable=False)
    normal_min = db.Column(db.Float, nullable=False)
    normal_max = db.Column(db.Float, nullable=False)
    units = db.Column(db.String(50), nullable=True)
