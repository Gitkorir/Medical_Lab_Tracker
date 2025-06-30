# server/app/routes/__init__.py
from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .lab_test_routes import lab_test_bp
from .reference_range_routes import reference_bp
from .dashboard_routes import dashboard_bp

def register_routes(app):
    """Register all blueprint routes with the Flask app"""
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(patient_bp, url_prefix='/patients')
    app.register_blueprint(lab_test_bp, url_prefix='/tests')
    app.register_blueprint(reference_bp, url_prefix='/reference_ranges')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    
    # Optional: Add a health check route
    @app.route('/health')
    def health_check():
        return {"status": "ok", "message": "Medical Lab Tracker API is running"}, 200