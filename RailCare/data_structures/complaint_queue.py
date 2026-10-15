"""
RailCare - Queue Data Structure Implementation
Using Python's collections.deque for high-performance First-In, First-Out (FIFO) queue operations.

Time Complexity Analysis:
- Enqueue (append): O(1) amortized
- Dequeue (popleft): O(1)
- Peek (front element): O(1)
- Size lookup: O(1)
- Search / Lookup: O(n)

Why collections.deque over a standard Python list?
A standard Python list implements dynamic arrays. While list.append() is O(1), list.pop(0)
requires shifting all remaining elements to the left, taking O(n) time.
collections.deque is implemented as a doubly-linked block list, guaranteeing O(1)
time complexity for both appends and pops on either side.
"""

from collections import deque
from typing import Optional, Dict, Any, List

class ComplaintQueue:
    def __init__(self):
        # The internal queue storing pending complaint dictionaries in FIFO order
        self._queue: deque = deque()
        # Set to prevent duplicate complaints from entering the queue
        self._queued_ids: set = set()

    def enqueue(self, complaint: Dict[str, Any]) -> bool:
        """
        Add a newly submitted pending complaint to the rear of the queue.
        Time Complexity: O(1)
        Returns:
            bool: True if complaint added, False if duplicate or invalid.
        """
        if not complaint or 'complaint_id' not in complaint:
            return False

        cid = complaint['complaint_id']
        if cid in self._queued_ids:
            return False  # Prevent duplicate entry

        self._queue.append(complaint)
        self._queued_ids.add(cid)
        return True

    def dequeue(self) -> Optional[Dict[str, Any]]:
        """
        Remove and return the oldest pending complaint from the front of the queue (FIFO).
        Time Complexity: O(1)
        Returns:
            dict or None: The complaint dictionary at the front of the queue.
        """
        if not self._queue:
            return None

        complaint = self._queue.popleft()
        cid = complaint.get('complaint_id')
        if cid and cid in self._queued_ids:
            self._queued_ids.remove(cid)
        return complaint

    def peek(self) -> Optional[Dict[str, Any]]:
        """
        Inspect the next complaint to be processed without removing it.
        Time Complexity: O(1)
        """
        if not self._queue:
            return None
        return self._queue[0]

    def remove_by_id(self, complaint_id: str) -> bool:
        """
        Remove a complaint if its status changes outside the queue (e.g. direct admin update).
        Time Complexity: O(n)
        """
        if complaint_id not in self._queued_ids:
            return False

        temp_deque = deque()
        found = False
        while self._queue:
            item = self._queue.popleft()
            if item.get('complaint_id') == complaint_id:
                found = True
            else:
                temp_deque.append(item)

        self._queue = temp_deque
        if found:
            self._queued_ids.discard(complaint_id)
        return found

    def to_list(self) -> List[Dict[str, Any]]:
        """Return a snapshot of current queued items as a standard Python list."""
        return list(self._queue)

    def size(self) -> int:
        """Return current number of pending complaints in the queue. Time Complexity: O(1)."""
        return len(self._queue)

    def is_empty(self) -> bool:
        """Check if queue has no pending items. Time Complexity: O(1)."""
        return len(self._queue) == 0

    def rebuild_from_db(self, db_conn) -> int:
        """
        Reconstruct the pending complaint queue from persistent SQLite records
        when the server boots or restarts. Orders complaints chronologically (FIFO).
        
        Preserves SQLite as the single source of truth while keeping the in-memory queue fast.
        """
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT c.*, u.full_name as passenger_name, u.email as passenger_email, u.mobile as passenger_mobile
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'Pending'
            ORDER BY c.created_at ASC;
        """)
        rows = cursor.fetchall()

        self._queue.clear()
        self._queued_ids.clear()

        count = 0
        for row in rows:
            complaint_dict = dict(row)
            self.enqueue(complaint_dict)
            count += 1

        return count


# Singleton instance shared across the web application
pending_complaint_queue = ComplaintQueue()
