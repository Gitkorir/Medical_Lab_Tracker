from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.test_reference_range import TestReferenceRange

reference_bp = Blueprint('reference_ranges', __name__)

# ✅ MAKE AUTHENTICATION OPTIONAL FOR TESTING
@reference_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_reference_ranges():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        parameter = request.args.get('parameter', type=str)

        # Start with base query
        query = TestReferenceRange.query

        # Filter by parameter if provided
        if parameter:
            query = query.filter(TestReferenceRange.parameter.ilike(f"%{parameter}%"))

        # Paginate results
        ranges = query.paginate(page=page, per_page=per_page, error_out=False)

        result = []
        for r in ranges.items:
            result.append({
                "id": r.id,
                "parameter": r.parameter,
                "normal_min": r.normal_min,
                "normal_max": r.normal_max,
                "units": r.units
            })

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

    except Exception as e:
        print(f"Reference range error: {str(e)}")
        return jsonify({"error": "Failed to fetch reference ranges"}), 500

@reference_bp.route("/", methods=["POST"])
@jwt_required(optional=True)
def add_reference_range():
    try:
        data = request.get_json()

        required_fields = ["parameter", "normal_min", "normal_max", "units"]
        missing_fields = [f for f in required_fields if f not in data or data[f] in [None, ""]]

        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        new_range = TestReferenceRange(
            parameter=data["parameter"].strip(),
            normal_min=float(data["normal_min"]),
            normal_max=float(data["normal_max"]),
            units=data["units"].strip()
        )
        
        db.session.add(new_range)
        db.session.commit()
        
        return jsonify({
            "message": "Reference range added", 
            "id": new_range.id,
            "data": {
                "id": new_range.id,
                "parameter": new_range.parameter,
                "normal_min": new_range.normal_min,
                "normal_max": new_range.normal_max,
                "units": new_range.units
            }
        }), 201

    except ValueError:
        return jsonify({"error": "normal_min and normal_max must be numbers"}), 400
    except Exception as e:
        print(f"Add reference range error: {str(e)}")  # For debugging
        return jsonify({"error": "Failed to add reference range"}), 500

# ✅ ADD: Test endpoint
@reference_bp.route("/test", methods=["GET"])
def test_reference_ranges():
    return jsonify({"message": "Reference ranges endpoint is working!", "status": "ok"}), 200