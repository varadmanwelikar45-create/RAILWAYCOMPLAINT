import os
from flask import Flask, render_template
from config import Config
from database import init_db, get_db
from data_structures.complaint_queue import pending_complaint_queue
from routes.auth import auth_bp
from routes.user import user_bp
from routes.complaints import complaints_bp
from routes.admin import admin_bp

def create_app():
    """Application factory for RailCare."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize SQLite database schema and admin account
    with app.app_context():
        init_db()
        # Synchronize in-memory FIFO queue with persistent SQLite pending complaints
        conn = get_db()
        rebuilt_count = pending_complaint_queue.rebuild_from_db(conn)
        conn.close()
        print(f"[RailCare Queue] FIFO Complaint Queue rebuilt with {rebuilt_count} pending items from SQLite.")

    # Register modular blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(admin_bp)

    @app.route('/')
    def index():
        """Page 1: Landing Page with introduction and quick action links."""
        return render_template('index.html')

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('base.html', content="<div class='container py-5 text-center'><h2>404 - Page Not Found</h2><p class='text-muted'>The requested page could not be located.</p><a href='/' class='btn btn-primary mt-3'>Return to Home</a></div>"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('base.html', content="<div class='container py-5 text-center'><h2>500 - Server Error</h2><p class='text-muted'>An unexpected error occurred. Please try again shortly.</p><a href='/' class='btn btn-primary mt-3'>Return to Home</a></div>"), 500

    return app

app = create_app()

if __name__ == '__main__':
    # Run locally on port 5000 in debug mode
    print("=" * 60)
    print("  RailCare — Railway Complaint Management System")
    print("  Data Structures Mini Project (Python / Flask / SQLite)")
    print("  Administrator Email:    ", Config.ADMIN_EMAIL)
    print("  Administrator Password: ", Config.ADMIN_PASSWORD)
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
