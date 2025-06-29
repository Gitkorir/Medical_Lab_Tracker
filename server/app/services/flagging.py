from app.models.test_reference_range import TestReferenceRange

def flag_abnormal(test_type, values):
    flagged = False

    for parameter, actual_value in values.items():
        if isinstance(actual_value, str):  # Non-numeric (e.g., COVID-19)
            if test_type == "COVID-19" and actual_value.lower() == "positive":
                return True
            continue

        ref = TestReferenceRange.query.filter_by(test_type=test_type, parameter=parameter).first()
        if ref:
            if (ref.min_value is not None and actual_value < ref.min_value) or \
               (ref.max_value is not None and actual_value > ref.max_value):
                flagged = True

    return flagged
