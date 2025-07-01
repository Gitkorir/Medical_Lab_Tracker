from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .lab_test_routes import lab_test_bp
from .reference_range_routes import reference_bp
from .dashboard_routes import dashboard_bp

def register_routes(app):
    """Register all blueprint routes with the Flask app"""
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(lab_test_bp, url_prefix='/api/tests')
    app.register_blueprint(reference_bp, url_prefix='/api/reference_ranges')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Optional: Add a health check route
    @app.route('/health')
    def health_check():
        return {"status": "ok", "message": "Medical Lab Tracker API is running"}, 200 

    # --- TEMPORARY: Migration trigger endpoint ---
    # UNCOMMENT to run migrations on Render free plan, then COMMENT OUT or remove for security!
    # from flask_migrate import upgrade
    # @app.route('/run-migrations')
    # def run_migrations():
    #     try:
    #         upgrade()
    #         return {"message": "Migrations applied successfully."}, 200
    #     except Exception as e:
    #         return {"error": str(e)}, 500