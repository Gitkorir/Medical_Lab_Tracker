from ..extensions import db

class TestReferenceRange(db.Model):
    __tablename__ = "reference_ranges"

    id = db.Column(db.Integer, primary_key=True)
    test_type = db.Column(db.String, nullable=False)          # e.g., CBC, Cholesterol
    parameter = db.Column(db.String, nullable=False)          # e.g., hemoglobin, ALT
    min_value = db.Column(db.Float, nullable=True)
    max_value = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return f"<Range {self.test_type} - {self.parameter}: {self.min_value}-{self.max_value}>"
