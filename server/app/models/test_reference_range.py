from ..extensions import db

class TestReferenceRange(db.Model):
    __tablename__ = "test_reference_ranges"

    id = db.Column(db.Integer, primary_key=True)
    test_type = db.Column(db.String(100), nullable=False)
    parameter = db.Column(db.String(100), nullable=False)
    min_value = db.Column(db.Float)
    max_value = db.Column(db.Float)
    units = db.Column(db.String(50))