from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..extensions import db
from ..models.test_reference_range import TestReferenceRange

reference_bp = Blueprint('reference_ranges', __name__)

@reference_bp.route("/", methods=["GET", "POST"])
@jwt_required(optional=True)
def reference_ranges_collection():
    if request.method == "GET":
        # List with pagination and optional search
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 20))
            if page < 1 or per_page < 1 or per_page > 100:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({"error": "Query parameters 'page' and 'per_page' must be positive integers, per_page max is 100."}), 422

        parameter = request.args.get('parameter', type=str)
        query = TestReferenceRange.query
        if parameter:
            query = query.filter(TestReferenceRange.parameter.ilike(f"%{parameter}%"))
        try:
            ranges = query.paginate(page=page, per_page=per_page, error_out=False)
        except Exception as e:
            return jsonify({"error": f"Failed to paginate: {str(e)}"}), 422

        result = [{
            "id": r.id,
            "parameter": r.parameter,
            "normal_min": r.normal_min,
            "normal_max": r.normal_max,
            "units": r.units
        } for r in ranges.items]

        return jsonify({
            "data": result,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": ranges.total,
                "pages": ranges.pages,
                "has_next": ranges.has_next,
                "has_prev": ranges.has_prev,
            }
        }), 200

    elif request.method == "POST":
        # Create new
        try:
            data = request.get_json(force=True)
            required = ["parameter", "normal_min", "normal_max", "units"]
            missing = [f for f in required if f not in data or data[f] in [None, ""]]
            if missing:
                return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

            # Validate numeric values
            try:
                normal_min = float(data["normal_min"])
                normal_max = float(data["normal_max"])
                if normal_min < 0 or normal_max < 0:
                    return jsonify({"error": "normal_min and normal_max must be positive numbers."}), 422
                if normal_min >= normal_max:
                    return jsonify({"error": "normal_max must be greater than normal_min."}), 422
            except (ValueError, TypeError):
                return jsonify({"error": "normal_min and normal_max must be numbers."}), 422

            new_range = TestReferenceRange(
                parameter=data["parameter"].strip(),
                normal_min=normal_min,
                normal_max=normal_max,
                units=data["units"].strip()
            )
            db.session.add(new_range)
            db.session.commit()
            return jsonify({
                "message": "Reference range added",
                "data": {
                    "id": new_range.id,
                    "parameter": new_range.parameter,
                    "normal_min": new_range.normal_min,
                    "normal_max": new_range.normal_max,
                    "units": new_range.units
                }
            }), 201
        except Exception as e:
            print(f"Reference range POST error: {str(e)}")
            return jsonify({"error": "Failed to add reference range"}), 500

@reference_bp.route("/<int:range_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required(optional=True)
def reference_range_item(range_id):
    range_obj = TestReferenceRange.query.get(range_id)
    if not range_obj:
        return jsonify({"error": "Reference range not found"}), 404

    if request.method == "GET":
        # Get by ID
        return jsonify({
            "id": range_obj.id,
            "parameter": range_obj.parameter,
            "normal_min": range_obj.normal_min,
            "normal_max": range_obj.normal_max,
            "units": range_obj.units
        }), 200

    elif request.method == "PUT":
        # Update
        try:
            data = request.get_json(force=True)
            updated = False
            for field in ["parameter", "normal_min", "normal_max", "units"]:
                if field in data and data[field] not in [None, ""]:
                    value = data[field]
                    if field in ["normal_min", "normal_max"]:
                        try:
                            value = float(value)
                            if value < 0:
                                return jsonify({"error": f"{field} must be a positive number."}), 422
                        except (ValueError, TypeError):
                            return jsonify({"error": f"{field} must be a number."}), 422
                        setattr(range_obj, field, value)
                    else:
                        setattr(range_obj, field, value.strip())
                    updated = True
            if not updated:
                return jsonify({"error": "No valid fields to update."}), 400

            # Validation: normal_min < normal_max
            if range_obj.normal_min >= range_obj.normal_max:
                return jsonify({"error": "normal_max must be greater than normal_min."}), 422

            db.session.commit()
            return jsonify({
                "message": "Reference range updated",
                "data": {
                    "id": range_obj.id,
                    "parameter": range_obj.parameter,
                    "normal_min": range_obj.normal_min,
                    "normal_max": range_obj.normal_max,
                    "units": range_obj.units
                }
            }), 200
        except Exception as e:
            print(f"Reference range PUT error: {str(e)}")
            return jsonify({"error": "Failed to update reference range"}), 500

    elif request.method == "DELETE":
        # Delete
        try:
            db.session.delete(range_obj)
            db.session.commit()
            return jsonify({"message": "Reference range deleted"}), 200
        except Exception as e:
            print(f"Reference range DELETE error: {str(e)}")
            return jsonify({"error": "Failed to delete reference range"}), 500