def flag_abnormal(test_type, values):
    """
    Returns True if the test result is abnormal, False otherwise.
    Extend logic per test_type.
    """
    if test_type == "CBC":
        hb = values.get("hemoglobin")
        wbc = values.get("wbc")

        if hb is not None and (hb < 13.5 or hb > 17.5):
            return True
        if wbc is not None and (wbc < 4.0 or wbc > 11.0):
            return True

    elif test_type == "Cholesterol":
        ldl = values.get("ldl")
        hdl = values.get("hdl")

        if ldl and ldl > 130:
            return True
        if hdl and hdl < 40:
            return True

    # Add more tests here...
    
    return False
