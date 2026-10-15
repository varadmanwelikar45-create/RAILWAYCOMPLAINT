"""
RailCare - Optional Database Seeding Script
Populates the SQLite database with realistic demonstration passengers and complaints
to showcase Queue (FIFO), Merge Sort, Linear Search, and Category distribution.
"""

import sqlite3
from datetime import datetime, timedelta
from config import Config
from database import get_db, init_db, generate_password_hash

def seed_database():
    print("[Seed] Initializing database schema...")
    init_db()

    conn = get_db()
    cursor = conn.cursor()

    # Create demo passengers
    passengers = [
        ("Rahul Sharma", "rahul.sharma@example.com", "9820112233", "Passenger@123"),
        ("Priya Patil", "priya.patil@example.com", "9820445566", "Passenger@123"),
        ("Anil Kumar", "anil.kumar@example.com", "9820778899", "Passenger@123"),
        ("Sneha Deshmukh", "sneha.deshmukh@example.com", "9820990011", "Passenger@123")
    ]

    passenger_ids = []
    for full_name, email, mobile, password in passengers:
        cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
        existing = cursor.fetchone()
        if existing:
            passenger_ids.append(existing['id'])
        else:
            h_pw = generate_password_hash(password)
            cursor.execute("""
                INSERT INTO users (full_name, email, mobile, password_hash, is_admin)
                VALUES (?, ?, ?, ?, 0);
            """, (full_name, email, mobile, h_pw))
            passenger_ids.append(cursor.lastrowid)

    print(f"[Seed] Created/found {len(passenger_ids)} demo passengers.")

    # Base complaints dataset
    now = datetime.utcnow()
    sample_complaints = [
        {
            "cid": "RC1001",
            "user_idx": 0,
            "train": "12951 / Mumbai Rajdhani Express",
            "pnr": "2458901234",
            "date": (now - timedelta(days=2)).strftime('%Y-%m-%d'),
            "category": "Cleanliness",
            "subject": "Dirty coach floor and uncleaned washroom in B3",
            "desc": "Coach B3 washroom was waterlogged and lacked handwash liquid throughout the overnight journey from Surat to Kota.",
            "loc": "Coach B3, Berth 24",
            "status": "Pending",
            "offset_mins": 180
        },
        {
            "cid": "RC1002",
            "user_idx": 1,
            "train": "22436 / Vande Bharat Express",
            "pnr": "8765432190",
            "date": (now - timedelta(days=2)).strftime('%Y-%m-%d'),
            "category": "Catering and Food Quality",
            "subject": "Substandard dinner food quality and missing sealed water bottle",
            "desc": "The meal served after Kanpur was cold and stale. Rail Neer water bottle had already expired packaging seal.",
            "loc": "Executive Chair Car C1, Seat 14",
            "status": "In Progress",
            "offset_mins": 140
        },
        {
            "cid": "RC1003",
            "user_idx": 2,
            "train": "12002 / Bhopal Shatabdi",
            "pnr": "4521098734",
            "date": (now - timedelta(days=1)).strftime('%Y-%m-%d'),
            "category": "Electrical Issues",
            "subject": "AC cooling failure and non-functional charging socket",
            "desc": "The mobile charging socket near window seat 42 was completely dead. Air conditioning vents were blowing warm air for over 3 hours.",
            "loc": "Coach C4, Seat 42",
            "status": "Pending",
            "offset_mins": 110
        },
        {
            "cid": "RC1004",
            "user_idx": 3,
            "train": "12137 / Punjab Mail",
            "pnr": "6789123456",
            "date": (now - timedelta(days=1)).strftime('%Y-%m-%d'),
            "category": "Train Delay",
            "subject": "Unannounced 4-hour delay without passenger announcement",
            "desc": "Train held at outer signal outside Itarsi for 4 hours with no PA announcement or onboard updates provided to passengers.",
            "loc": "Coach S5, Berth 33",
            "status": "Resolved",
            "offset_mins": 75
        },
        {
            "cid": "RC1005",
            "user_idx": 0,
            "train": "12259 / Sealdah Bikaner AC Duronto",
            "pnr": "9812345678",
            "date": now.strftime('%Y-%m-%d'),
            "category": "Water Availability",
            "subject": "No running water in coach toilets since morning",
            "desc": "Overhead water tank ran out of water after Mughalsarai junction. Unable to use toilets in coach A2.",
            "loc": "Coach A2, Berth 12",
            "status": "Pending",
            "offset_mins": 30
        },
        {
            "cid": "RC1006",
            "user_idx": 1,
            "train": "12904 / Golden Temple Mail",
            "pnr": "5432167890",
            "date": now.strftime('%Y-%m-%d'),
            "category": "Security and Safety",
            "subject": "Unauthorized hawkers and beggars roaming in reserved sleeper",
            "desc": "Multiple unauthorized vendors boarding and disturbing passengers sleeping at night between Ratlam and Nagda.",
            "loc": "Coach S2, Berth 18",
            "status": "Pending",
            "offset_mins": 10
        }
    ]

    for comp in sample_complaints:
        cursor.execute("SELECT id FROM complaints WHERE complaint_id = ?;", (comp['cid'],))
        if not cursor.fetchone():
            c_time = (now - timedelta(minutes=comp['offset_mins'])).strftime('%Y-%m-%d %H:%M:%S')
            uid = passenger_ids[comp['user_idx']]
            cursor.execute("""
                INSERT INTO complaints (
                    complaint_id, user_id, train_number, pnr_number, journey_date,
                    category, subject, description, location, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                comp['cid'], uid, comp['train'], comp['pnr'], comp['date'],
                comp['category'], comp['subject'], comp['desc'], comp['loc'],
                comp['status'], c_time, c_time
            ))
            print(f"  + Added complaint {comp['cid']} ({comp['category']}) - Status: {comp['status']}")

    conn.commit()
    conn.close()
    print("[Seed] Seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
