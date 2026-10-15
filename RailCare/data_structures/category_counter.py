"""
RailCare - Category Counter Implementation
Uses Python dictionaries (hash tables) to aggregate and count complaint categories.

Time Complexity Analysis:
- Hash map insertion/update: Average O(1)
- Iterating through n complaints: O(n) total time
- Space Complexity: O(c) where c is the number of distinct categories (bounded by 9).
"""

from typing import List, Dict, Any, Optional

DEFAULT_CATEGORIES = {
    'Cleanliness',
    'Catering and Food Quality',
    'Electrical Issues',
    'Water Availability',
    'Staff Behaviour',
    'Ticketing Issues',
    'Train Delay',
    'Security and Safety',
    'Other'
}

try:
    from config import Config
    ALLOWED_CATEGORIES = Config.ALLOWED_CATEGORIES
except (ImportError, ModuleNotFoundError):
    ALLOWED_CATEGORIES = DEFAULT_CATEGORIES

def count_complaints_by_category(complaints: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Count complaints across all allowed railway categories using a Python dictionary.

    Args:
        complaints: List of complaint dictionary records.

    Returns:
        Dict[str, int]: Mapping from category name to complaint frequency count.
    """
    # Initialize dictionary with 0 counts for all predefined categories
    category_counts = {cat: 0 for cat in sorted(ALLOWED_CATEGORIES)}

    for complaint in complaints:
        cat = complaint.get('category')
        if cat in category_counts:
            category_counts[cat] += 1
        elif cat:
            # Handle any custom or unexpected category gracefully
            category_counts[cat] = category_counts.get(cat, 0) + 1

    return category_counts

def calculate_status_distribution(complaints: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Count complaints across statuses (Pending, In Progress, Resolved).
    """
    status_counts = {
        'Total': len(complaints),
        'Pending': 0,
        'In Progress': 0,
        'Resolved': 0
    }

    for complaint in complaints:
        status = complaint.get('status')
        if status in status_counts:
            status_counts[status] += 1

    return status_counts
