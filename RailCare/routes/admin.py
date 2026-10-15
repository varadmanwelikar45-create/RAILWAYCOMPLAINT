from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from datetime import datetime
from database import get_db
from config import Config
from data_structures.complaint_queue import pending_complaint_queue
from data_structures.search import linear_search_complaints
from data_structures.sorting import merge_sort_complaints
from data_structures.category_counter import count_complaints_by_category

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.before_request
def require_admin():
    """Restricted access guard: Ensure authenticated user has administrator privileges."""
    if not session.get('user_id') or not session.get('is_admin'):
        flash('Administrator access required. Please authenticate with administrator credentials.', 'danger')
        return redirect(url_for('auth.admin_login'))

@admin_bp.route('/dashboard')
def dashboard():
    """
    Administrator Dashboard showcasing:
    1. Summary Metrics
    2. FIFO Queue status and next item
    3. Category distribution using Python Dictionary
    4. Complaint search using Linear Search O(n)
    5. Complaint ordering using Merge Sort O(n log n)
    6. Category and Status filtering
    """
    search_query = request.args.get('search', '').strip()
    selected_category = request.args.get('category', '').strip()
    selected_status = request.args.get('status', '').strip()
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')

    conn = get_db()
    cursor = conn.cursor()

    # Query all complaints with passenger details
    cursor.execute("""
        SELECT c.*, u.full_name as passenger_name, u.email as passenger_email, u.mobile as passenger_mobile
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC;
    """)
    rows = cursor.fetchall()
    conn.close()

    # 1. LIST: Convert SQLite rows into Python list of dictionaries
    all_complaints = [dict(row) for row in rows]

    # Global summary calculations
    summary = {
        'total': len(all_complaints),
        'pending': sum(1 for c in all_complaints if c['status'] == 'Pending'),
        'in_progress': sum(1 for c in all_complaints if c['status'] == 'In Progress'),
        'resolved': sum(1 for c in all_complaints if c['status'] == 'Resolved')
    }

    # 2. DICTIONARY: Category-wise frequency distribution
    category_counts = count_complaints_by_category(all_complaints)

    # Filter pipeline start
    filtered_complaints = list(all_complaints)

    # 3. LINEAR SEARCH: Filter by search query (Complaint ID, Passenger Name, Train, or PNR)
    if search_query:
        filtered_complaints = linear_search_complaints(filtered_complaints, search_query)

    # Apply Category filter
    if selected_category and selected_category in Config.ALLOWED_CATEGORIES:
        filtered_complaints = [c for c in filtered_complaints if c.get('category') == selected_category]

    # Apply Status filter
    if selected_status and selected_status in Config.VALID_STATUSES:
        filtered_complaints = [c for c in filtered_complaints if c.get('status') == selected_status]

    # 4. MERGE SORT: Sort complaint collection by selected key in O(n log n)
    is_reverse = (sort_order.lower() == 'desc')
    sorted_complaints = merge_sort_complaints(filtered_complaints, sort_key=sort_by, reverse=is_reverse)

    # 5. QUEUE INSPECTION: Snapshot of FIFO queue elements currently waiting
    queue_items = pending_complaint_queue.to_list()
    next_in_queue = pending_complaint_queue.peek()

    return render_template(
        'admin_dashboard.html',
        summary=summary,
        complaints=sorted_complaints,
        category_counts=category_counts,
        allowed_categories=sorted(Config.ALLOWED_CATEGORIES),
        queue_items=queue_items,
        next_in_queue=next_in_queue,
        queue_size=pending_complaint_queue.size(),
        search_query=search_query,
        selected_category=selected_category,
        selected_status=selected_status,
        sort_by=sort_by,
        sort_order=sort_order
    )

@admin_bp.route('/process-next', methods=['POST'])
def process_next_complaint():
    """
    Demonstrate FIFO Queue processing:
    Pops the earliest pending complaint from the collections.deque FIFO queue
    and updates its status in SQLite to 'In Progress'.
    """
    next_complaint = pending_complaint_queue.dequeue()

    if not next_complaint:
        flash('The pending complaints queue is currently empty. No pending complaints to process.', 'info')
        return redirect(url_for('admin.dashboard'))

    complaint_id = next_complaint['complaint_id']
    now_iso = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE complaints 
        SET status = 'In Progress', updated_at = ?
        WHERE complaint_id = ?;
    """, (now_iso, complaint_id))
    conn.commit()
    conn.close()

    flash(
        f"FIFO Queue Dequeue Success: Earliest complaint {complaint_id} ({next_complaint.get('category')}) "
        f"for {next_complaint.get('passenger_name')} has been moved to 'In Progress'.",
        'success'
    )
    return redirect(url_for('admin.dashboard'))

@admin_bp.route('/update-status/<complaint_id>', methods=['POST'])
def update_status(complaint_id):
    """Update status of any complaint to Pending, In Progress, or Resolved."""
    new_status = request.form.get('status', '').strip()

    if new_status not in Config.VALID_STATUSES:
        flash('Invalid status provided.', 'danger')
        return redirect(url_for('admin.dashboard'))

    now_iso = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.*, u.full_name as passenger_name, u.email as passenger_email, u.mobile as passenger_mobile
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        WHERE c.complaint_id = ?;
    """, (complaint_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        flash('Complaint not found.', 'danger')
        return redirect(url_for('admin.dashboard'))

    cursor.execute("""
        UPDATE complaints 
        SET status = ?, updated_at = ?
        WHERE complaint_id = ?;
    """, (new_status, now_iso, complaint_id))
    conn.commit()
    conn.close()

    # Synchronize queue based on status change
    if new_status == 'Pending':
        complaint_dict = dict(row)
        complaint_dict['status'] = 'Pending'
        pending_complaint_queue.enqueue(complaint_dict)
    else:
        pending_complaint_queue.remove_by_id(complaint_id)

    flash(f'Complaint {complaint_id} status updated to "{new_status}".', 'success')
    return redirect(request.referrer or url_for('admin.dashboard'))
