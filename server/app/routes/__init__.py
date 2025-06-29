from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .lab_test_routes import lab_test_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(patient_bp, url_prefix='/patients')
    app.register_blueprint(lab_test_bp, url_prefix='/tests')
    
