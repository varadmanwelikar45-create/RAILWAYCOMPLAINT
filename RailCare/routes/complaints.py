from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from datetime import datetime
import random
from database import get_db
from config import Config
from data_structures.complaint_queue import pending_complaint_queue

complaints_bp = Blueprint('complaints', __name__, url_prefix='/complaints')

def generate_unique_complaint_id(cursor) -> str:
    """Generate a unique human-friendly complaint reference like RC1001."""
    cursor.execute("SELECT COUNT(*) FROM complaints;")
    total = cursor.fetchone()[0]
    next_num = 1001 + total
    candidate = f"RC{next_num}"

    # Verify uniqueness in database
    cursor.execute("SELECT id FROM complaints WHERE complaint_id = ?;", (candidate,))
    while cursor.fetchone() is not None:
        next_num += 1
        candidate = f"RC{next_num}"

    return candidate

@complaints_bp.route('/new', methods=['GET', 'POST'])
def register_complaint():
    """Register a new railway complaint."""
    if 'user_id' not in session:
        flash('You must log in before registering a complaint.', 'warning')
        return redirect(url_for('auth.login'))

    if request.method == 'POST':
        train_number = request.form.get('train_number', '').strip()
        pnr_number = request.form.get('pnr_number', '').strip()
        journey_date = request.form.get('journey_date', '').strip()
        category = request.form.get('category', '').strip()
        subject = request.form.get('subject', '').strip()
        description = request.form.get('description', '').strip()
        location = request.form.get('location', '').strip()

        # Validation
        if not train_number or not journey_date or not category or not subject or not description:
            flash('Please complete all mandatory fields marked with an asterisk (*).', 'danger')
            return render_template(
                'register_complaint.html',
                categories=sorted(Config.ALLOWED_CATEGORIES),
                form_data=request.form
            )

        # Practical Data Structure: Set membership validation (O(1))
        if category not in Config.ALLOWED_CATEGORIES:
            flash(f'Invalid category "{category}". Please select a valid category from the list.', 'danger')
            return render_template(
                'register_complaint.html',
                categories=sorted(Config.ALLOWED_CATEGORIES),
                form_data=request.form
            )

        conn = get_db()
        cursor = conn.cursor()
        complaint_id = generate_unique_complaint_id(cursor)

        try:
            now_iso = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute("""
                INSERT INTO complaints (
                    complaint_id, user_id, train_number, pnr_number, 
                    journey_date, category, subject, description, location, 
                    status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?);
            """, (
                complaint_id, session['user_id'], train_number, pnr_number or None,
                journey_date, category, subject, description, location or None,
                now_iso, now_iso
            ))
            conn.commit()

            # Retrieve passenger details for queue dictionary record
            cursor.execute("SELECT full_name, email, mobile FROM users WHERE id = ?;", (session['user_id'],))
            user_row = cursor.fetchone()
            conn.close()

            # Enqueue complaint into our FIFO queue (collections.deque)
            queue_record = {
                'complaint_id': complaint_id,
                'user_id': session['user_id'],
                'passenger_name': user_row['full_name'] if user_row else session.get('user_name', 'Passenger'),
                'passenger_email': user_row['email'] if user_row else '',
                'passenger_mobile': user_row['mobile'] if user_row else '',
                'train_number': train_number,
                'pnr_number': pnr_number,
                'journey_date': journey_date,
                'category': category,
                'subject': subject,
                'description': description,
                'location': location,
                'status': 'Pending',
                'created_at': now_iso
            }
            pending_complaint_queue.enqueue(queue_record)

            flash(f'Your complaint has been registered successfully with Reference ID: {complaint_id}', 'success')
            return redirect(url_for('complaints.track_complaint', complaint_id=complaint_id))

        except Exception as e:
            conn.close()
            flash(f'Could not record complaint due to a database error. Please try again.', 'danger')
            return render_template(
                'register_complaint.html',
                categories=sorted(Config.ALLOWED_CATEGORIES),
                form_data=request.form
            )

    return render_template('register_complaint.html', categories=sorted(Config.ALLOWED_CATEGORIES))

@complaints_bp.route('/track/<complaint_id>')
def track_complaint(complaint_id):
    """View detailed information and status history for a specific complaint."""
    if 'user_id' not in session:
        flash('Please log in to track your complaint.', 'warning')
        return redirect(url_for('auth.login'))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.*, u.full_name as passenger_name, u.email as passenger_email, u.mobile as passenger_mobile
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        WHERE c.complaint_id = ?;
    """, (complaint_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        flash(f'Complaint with ID "{complaint_id}" was not found.', 'danger')
        if session.get('is_admin'):
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('user.dashboard'))

    complaint = dict(row)

    # Authorization check: Normal passengers can only view their own complaints
    if not session.get('is_admin') and complaint['user_id'] != session['user_id']:
        flash('Access denied. You can only view complaints filed under your account.', 'danger')
        return redirect(url_for('user.dashboard'))

    return render_template('complaint_details.html', complaint=complaint, is_admin=session.get('is_admin', False))
