# Example flag_abnormal function
REFERENCE_RANGES = {
    "Hemoglobin": {"min": 13.0, "max": 17.0},  # Example, adjust as needed
    # Add other parameters here
}

def flag_abnormal(parameter, values):
    # Assume values is a dict like {"value": 13.5}
    ref = REFERENCE_RANGES.get(parameter)
    if not ref:
        return False  # Or True if you want to flag unknowns
    try:
        val = float(values.get("value"))
        return val < ref["min"] or val > ref["max"]
    except Exception:
        return False