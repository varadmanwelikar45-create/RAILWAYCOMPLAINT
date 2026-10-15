# RailCare — Railway Complaint Management System
> **Data Structures Mini-Project using Python, Flask & SQLite**  
> *Tagline: Your Voice. Better Railways.*

---

## 1. Project Overview

**RailCare** is a full-stack Railway Complaint Management System engineered for a college Data Structures mini-project. It allows railway passengers to register grievances across 9 predefined categories, track complaint lifecycles in real time, and provides administrators with a control center to process complaints in First-In, First-Out (FIFO) queue order, search complaints using Linear Search, sort complaints using Merge Sort, and analyze category distributions using hash tables.

---

## 2. Complete Project Folder Structure

```text
RailCare/
├── app.py                      # Flask Application entry point & queue bootstrapper
├── config.py                   # Configuration, secret keys, categories set & admin credentials
├── database.py                 # SQLite schema initialization with foreign keys (PRAGMA foreign_keys = ON)
├── requirements.txt            # Python dependencies (Flask, Werkzeug)
├── seed_data.py                # Optional demonstration data populator
├── README.md                   # Complete documentation, algorithm analysis & test guide
│
├── data_structures/            # Core Data Structures & Algorithms implementation modules
│   ├── __init__.py
│   ├── complaint_queue.py      # FIFO Queue using collections.deque with O(1) operations
│   ├── search.py               # Linear Search algorithm O(n) for ID & passenger search
│   ├── sorting.py              # Merge Sort algorithm O(n log n) by submission date
│   └── category_counter.py     # Python Dictionary frequency counter for categories
│
├── routes/                     # Modular Flask Blueprints
│   ├── __init__.py
│   ├── auth.py                 # Passenger registration, login, and admin authentication
│   ├── user.py                 # Passenger dashboard and grievance tracking
│   ├── complaints.py           # Complaint filing, Set validation, and ID generation
│   └── admin.py                # Admin dashboard, FIFO dequeuing, search, and sort
│
├── templates/                  # Jinja2 HTML5 Templates (Railway theme, zero-pill design)
│   ├── base.html               # Master layout, navigation, and flash alert toasts
│   ├── index.html              # Landing page with feature highlights
│   ├── register.html           # Passenger account registration form
│   ├── login.html              # Passenger authentication form
│   ├── admin_login.html        # Secure administrator login
│   ├── user_dashboard.html     # Passenger grievance summary and tracking table
│   ├── register_complaint.html # Multi-field complaint filing form
│   ├── complaint_details.html  # Step-by-step visual tracker and admin override
│   └── admin_dashboard.html    # Admin control center, FIFO queue viewer & filters
│
├── static/
│   ├── css/
│   │   └── style.css           # Clean railway design system (#12304A, #2563EB, #F4F7FB)
│   └── js/
│       └── main.js             # Form validation, char counter, alert dismissals
│
└── instance/
    └── railcare.db             # SQLite database (created automatically on startup)
```

---

## 3. Step-by-Step Installation & Execution Guide (VS Code on Windows)

### Prerequisites
* Windows 10 or 11
* Python 3.10 or higher installed from [python.org](https://www.python.org/) (check the box *"Add Python to PATH"* during installation)
* Visual Studio Code

### Step 1: Open the Project in VS Code
1. Extract or clone `RailCare` into a directory (e.g. `C:\Projects\RailCare`).
2. Open VS Code, click **File &rarr; Open Folder...**, and select `RailCare`.

### Step 2: Open PowerShell Terminal in VS Code
Open the integrated terminal in VS Code using ``Ctrl + ` `` or **Terminal &rarr; New Terminal**.

### Step 3: Create a Virtual Environment (Recommended)
```powershell
python -m venv venv
venv\Scripts\activate
```

### Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 5: (Optional) Seed Sample Demonstration Data
To populate the database with demo passengers and sample complaints across categories:
```powershell
python seed_data.py
```

### Step 6: Launch the Web Application
```powershell
python app.py
```
Output:
```text
============================================================
  RailCare — Railway Complaint Management System
  Data Structures Mini Project (Python / Flask / SQLite)
  Administrator Email:     admin@railcare.gov.in
  Administrator Password:  Admin@1234
============================================================
* Running on http://127.0.0.1:5000
```

### Step 7: Access the Web Application
Open your web browser and navigate to:
`http://127.0.0.1:5000`

---

## 4. Predefined Demonstration Credentials

| Role | Email Address | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@railcare.gov.in` | `Admin@1234` | Full access to Admin Dashboard, FIFO Dequeuing, Status Override |
| **Demo Passenger 1** | `rahul.sharma@example.com` | `Passenger@123` | Passenger dashboard, submit & track personal complaints |
| **Demo Passenger 2** | `priya.patil@example.com` | `Passenger@123` | Passenger dashboard, submit & track personal complaints |

*(You can also register any new passenger account directly on the registration page).*

---

## 5. Data Structures & Algorithms Implementation Details

| Data Structure / Algorithm | File | Real Application Purpose | Time Complexity |
|---|---|---|---|
| **FIFO Queue (`collections.deque`)** | `data_structures/complaint_queue.py` | Manages pending complaints in strict First-In, First-Out order so earliest grievances are prioritized. | **Enqueue:** O(1)<br>**Dequeue:** O(1)<br>**Peek:** O(1) |
| **Merge Sort** | `data_structures/sorting.py` | Divide-and-conquer algorithm to sort complaints by timestamp on the Admin Dashboard. Guarantees stable sort. | **Best:** O(n log n)<br>**Avg:** O(n log n)<br>**Worst:** O(n log n) |
| **Linear Search** | `data_structures/search.py` | Sequentially inspects complaint records to filter by Complaint ID, Passenger Name, Train, or PNR. | **Best:** O(1)<br>**Avg:** O(n)<br>**Worst:** O(n) |
| **Dictionary (Hash Table)** | `data_structures/category_counter.py` | Computes frequency count of complaints across 9 categories and status distributions. | **Insert/Lookup:** O(1) avg<br>**Total Counting:** O(n) |
| **Set** | `config.py` & `routes/complaints.py` | Validates submitted complaint categories against predefined allowed categories. | **Membership Test:** O(1) |
| **List** | Across routes | Holds records retrieved from SQLite for in-memory manipulation and rendering. | **Append:** O(1)<br>**Iteration:** O(n) |

### Why `collections.deque` Over Standard Python List for Queue?
In Python, a `list` is implemented as a contiguous dynamic array.
* Appending with `list.append()` is $O(1)$ amortized.
* Removing the front element with `list.pop(0)` takes $O(n)$ time because all remaining elements must be shifted in memory.
* `collections.deque` (Double-Ended Queue) is implemented as a doubly-linked list of fixed-size blocks, ensuring **$O(1)$ constant time** for both appending to the rear (`append`) and popping from the front (`popleft`).

### SQLite as Permanent Storage + In-Memory Queue Synchronization
* SQLite remains the permanent source of truth.
* Upon application boot (`app.py`), the function `pending_complaint_queue.rebuild_from_db(conn)` reads all complaints where `status = 'Pending'` ordered by `created_at ASC` and enqueues them into memory.
* If a complaint's status is changed by the administrator, the queue is kept strictly in sync, preventing any duplicate processing.

---

## 6. Manual Testing Checklist

| Test # | Test Case Description | Expected Result | Verified |
|---|---|---|---|
| **1** | Register a new passenger with valid fields | Account created; redirected to login with success flash. | [x] |
| **2** | Register with an existing email address | Rejected with duplicate email error alert. | [x] |
| **3** | Register with non-matching passwords | Client & server validation error preventing registration. | [x] |
| **4** | Log in with invalid passenger credentials | Access denied with warning message. | [x] |
| **5** | Log in with valid passenger credentials | Redirected to User Dashboard with personal complaint summary. | [x] |
| **6** | Submit a new complaint form | Validated against Set; saved in SQLite; enqueued into FIFO Queue; unique ID (e.g. `RC1007`) assigned. | [x] |
| **7** | View passenger dashboard | Only complaints filed by the logged-in user appear; metrics match database count. | [x] |
| **8** | Access admin dashboard as normal passenger | Access denied; redirected to Admin Login with warning. | [x] |
| **9** | Log in with admin credentials (`admin@railcare.gov.in`) | Admin dashboard opens with global summary cards and category distribution. | [x] |
| **10** | Linear Search on Admin Dashboard | Typing "Rahul" or "RC1001" filters records instantly using Linear Search O(n). | [x] |
| **11** | Merge Sort on Admin Dashboard | Switching sort order toggles complaints chronologically via Merge Sort O(n log n). | [x] |
| **12** | Process Next Pending Complaint (FIFO) | Clicking the FIFO button dequeues the earliest pending complaint and updates status to "In Progress". | [x] |
| **13** | Update Complaint Status to "Resolved" | Changes status in SQLite, updates timeline tracker, and removes item from queue. | [x] |
| **14** | Restart Server and verify Queue persistence | On restart, `rebuild_from_db` reloads all pending complaints in FIFO order from SQLite. | [x] |

---

## 7. Disclaimer
*This project is an academic simulation built for educational purposes in the subject Data Structures using Python. It is not affiliated with or endorsed by Indian Railways, IRCTC, or RailMadad.*
