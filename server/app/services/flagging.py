from ..models.test_reference_range import TestReferenceRange

def get_result_status(parameter, values):
    """
    Returns the status ('Low', 'High', 'Normal', 'Unknown') for a test parameter and value.
    """
    ref = TestReferenceRange.query.filter_by(parameter=parameter).first()
    if not ref:
        return "Unknown"
    try:
        val = float(values.get("value"))
        if val < ref.normal_min:
            return "Low"
        elif val > ref.normal_max:
            return "High"
        else:
            return "Normal"
    except Exception:
        return "Unknown"

def flag_abnormal(parameter, values):
    """
    Returns True if result is abnormal ('Low' or 'High'), False otherwise.
    """
    status = get_result_status(parameter, values)
    return status != "Normal"