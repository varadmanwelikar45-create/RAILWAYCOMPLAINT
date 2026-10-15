import sqlite3
import os
import hashlib
import binascii

try:
    from werkzeug.security import generate_password_hash
except ImportError:
    def generate_password_hash(password: str) -> str:
        # Standard library PBKDF2-HMAC fallback
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return 'pbkdf2:sha256:100000$' + binascii.hexlify(salt).decode('ascii') + '$' + binascii.hexlify(key).decode('ascii')

from config import Config

def get_db():
    """Establish and return an SQLite database connection with row access."""
    if not os.path.exists(Config.INSTANCE_DIR):
        os.makedirs(Config.INSTANCE_DIR, exist_ok=True)
        
    conn = sqlite3.connect(Config.DATABASE)
    conn.row_factory = sqlite3.Row
    # Crucial Requirement: Enable SQLite foreign-key enforcement
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initialize database tables, indexes, and initial admin record."""
    conn = get_db()
    cursor = conn.cursor()

    # Table 1: users
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Table 2: complaints
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        train_number TEXT NOT NULL,
        pnr_number TEXT,
        journey_date DATE NOT NULL,
        category TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Resolved')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    """)

    # Create helpful indexes for fast lookup
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);")

    # Check if default admin exists; if not, create securely with password hash
    cursor.execute("SELECT id FROM users WHERE email = ?;", (Config.ADMIN_EMAIL,))
    admin = cursor.fetchone()
    if not admin:
        hashed_pw = generate_password_hash(Config.ADMIN_PASSWORD)
        cursor.execute("""
            INSERT INTO users (full_name, email, mobile, password_hash, is_admin)
            VALUES (?, ?, ?, ?, 1);
        """, (Config.ADMIN_NAME, Config.ADMIN_EMAIL, '9876543210', hashed_pw))
        print(f"[RailCare DB] Default administrator initialized: {Config.ADMIN_EMAIL}")

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("RailCare database successfully initialized at:", Config.DATABASE)
