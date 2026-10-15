from flask import Blueprint, render_template, session, redirect, url_for, flash
from database import get_db

user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.before_request
def require_user_login():
    """Ensure passenger is authenticated prior to accessing user routes."""
    if 'user_id' not in session:
        flash('Please log in to access your passenger dashboard.', 'warning')
        return redirect(url_for('auth.login'))

@user_bp.route('/dashboard')
def dashboard():
    """Passenger dashboard displaying complaint summary cards and past complaints."""
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()

    # Query complaints belonging only to the authenticated user
    cursor.execute("""
        SELECT * FROM complaints 
        WHERE user_id = ? 
        ORDER BY created_at DESC;
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    # Python List of dictionaries
    complaints = [dict(row) for row in rows]

    # Calculate status counts using Python dictionary
    summary = {
        'total': len(complaints),
        'pending': sum(1 for c in complaints if c['status'] == 'Pending'),
        'in_progress': sum(1 for c in complaints if c['status'] == 'In Progress'),
        'resolved': sum(1 for c in complaints if c['status'] == 'Resolved')
    }

    return render_template(
        'user_dashboard.html',
        user_name=session.get('user_name', 'Passenger'),
        summary=summary,
        complaints=complaints
    )
