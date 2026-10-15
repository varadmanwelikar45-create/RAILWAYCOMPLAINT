"""
Data Structures package for RailCare Railway Complaint Management System.
Contains real Python data structure implementations:
- ComplaintQueue: FIFO Queue using collections.deque
- Linear Search: Search complaints by ID or Passenger Name
- Merge Sort: O(n log n) divide-and-conquer sorting by submission date
- CategoryCounter: Dictionary-based frequency counter for complaint categories
"""

from .complaint_queue import ComplaintQueue
from .search import linear_search_complaints
from .sorting import merge_sort_complaints
from .category_counter import count_complaints_by_category

__all__ = [
    'ComplaintQueue',
    'linear_search_complaints',
    'merge_sort_complaints',
    'count_complaints_by_category'
]
