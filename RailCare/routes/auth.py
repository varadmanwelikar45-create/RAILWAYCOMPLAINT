from flask import Blueprint, render_template, request, redirect, url_for, session, flash
import re
from database import get_db, generate_password_hash, check_password_hash
from config import Config

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'
MOBILE_REGEX = r'^\d{10}$'

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Handle new passenger account registration with validation."""
    if 'user_id' in session:
        return redirect(url_for('user.dashboard'))

    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        mobile = request.form.get('mobile', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Server-side validation
        if not full_name or not email or not mobile or not password or not confirm_password:
            flash('All fields are required. Please fill in the entire form.', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

        if not re.match(EMAIL_REGEX, email):
            flash('Please enter a valid email address (e.g., passenger@example.com).', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

        if not re.match(MOBILE_REGEX, mobile):
            flash('Please enter a valid 10-digit mobile number.', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

        if password != confirm_password:
            flash('Passwords do not match. Please re-enter them carefully.', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

        conn = get_db()
        cursor = conn.cursor()

        # Check for unique email address
        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            conn.close()
            flash('An account with this email address already exists. Please log in.', 'warning')
            return redirect(url_for('auth.login'))

        # Secure password hashing (Werkzeug PBKDF2/SHA256)
        hashed_password = generate_password_hash(password)

        try:
            cursor.execute("""
                INSERT INTO users (full_name, email, mobile, password_hash, is_admin)
                VALUES (?, ?, ?, ?, 0);
            """, (full_name, email, mobile, hashed_password))
            conn.commit()
            conn.close()
            flash('Account registered successfully! You may now log in to RailCare.', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            conn.close()
            flash('Registration could not be completed. Please verify your details and try again.', 'danger')
            return render_template('register.html', full_name=full_name, email=email, mobile=mobile)

    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Passenger login authentication."""
    if 'user_id' in session and not session.get('is_admin'):
        return redirect(url_for('user.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Please provide both email address and password.', 'warning')
            return render_template('login.html', email=email)

        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?;", (email,))
            user = cursor.fetchone()
            conn.close()

            if user and check_password_hash(user['password_hash'], password):
                # Set secure session
                session.clear()
                session['user_id'] = user['id']
                session['user_name'] = user['full_name']
                session['user_email'] = user['email']
                session['is_admin'] = bool(user['is_admin'])

                flash(f"Welcome back, {user['full_name']}!", 'success')
                if user['is_admin']:
                    return redirect(url_for('admin.dashboard'))
                return redirect(url_for('user.dashboard'))
            else:
                flash('Invalid email or password. Please verify your credentials and try again.', 'danger')
                return render_template('login.html', email=email)
        except Exception as e:
            flash('Unable to process login at this time. Please verify your credentials and try again.', 'danger')
            return render_template('login.html', email=email)

    return render_template('login.html')

@auth_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Dedicated Administrator login."""
    if 'user_id' in session and session.get('is_admin'):
        return redirect(url_for('admin.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')

        if not email or not password:
            flash('Admin credentials are required.', 'warning')
            return render_template('admin_login.html', email=email)

        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ? AND is_admin = 1;", (email,))
            admin = cursor.fetchone()
            conn.close()

            if admin and check_password_hash(admin['password_hash'], password):
                session.clear()
                session['user_id'] = admin['id']
                session['user_name'] = admin['full_name']
                session['user_email'] = admin['email']
                session['is_admin'] = True

                flash('Welcome to the RailCare Administrator Control Center.', 'success')
                return redirect(url_for('admin.dashboard'))
            else:
                flash('Administrator authentication failed. Unauthorized access is prohibited.', 'danger')
                return render_template('admin_login.html', email=email)
        except Exception as e:
            flash('Administrator authentication encountered an issue. Please verify your credentials.', 'danger')
            return render_template('admin_login.html', email=email)

    return render_template('admin_login.html', default_email=Config.ADMIN_EMAIL)

@auth_bp.route('/logout')
def logout():
    """Terminate the current user session."""
    session.clear()
    flash('You have been logged out securely.', 'info')
    return redirect(url_for('index'))
