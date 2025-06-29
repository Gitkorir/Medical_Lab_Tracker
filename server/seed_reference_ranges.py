from app import create_app, db
from app.models.test_reference_range import TestReferenceRange

app = create_app()
app.app_context().push()

# Clear existing data (optional)
# db.session.query(TestReferenceRange).delete()

# Define reference range data
ranges = [
    {"test_type": "CBC", "parameter": "hemoglobin", "min_value": 13.5, "max_value": 17.5},
    {"test_type": "CBC", "parameter": "wbc", "min_value": 4.0, "max_value": 11.0},
    {"test_type": "Cholesterol", "parameter": "ldl", "min_value": 0, "max_value": 130},
    {"test_type": "Cholesterol", "parameter": "hdl", "min_value": 40, "max_value": 999},
    {"test_type": "KFT", "parameter": "creatinine", "min_value": 0.6, "max_value": 1.3},
    {"test_type": "COVID-19", "parameter": "result", "min_value": None, "max_value": None},
]

# Add to database
for r in ranges:
    range_obj = TestReferenceRange(
        test_type=r["test_type"],
        parameter=r["parameter"],
        min_value=r["min_value"],
        max_value=r["max_value"]
    )
    db.session.add(range_obj)

db.session.commit()
print("✅ Seeded test reference ranges successfully.")
