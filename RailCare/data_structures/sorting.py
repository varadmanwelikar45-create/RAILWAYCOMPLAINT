"""
RailCare - Merge Sort Algorithm Implementation
A classic Divide-and-Conquer sorting algorithm to order complaint records by submission date,
journey date, or priority.

Time Complexity Analysis:
- Best Case: O(n log n)
- Average Case: O(n log n)
- Worst Case: O(n log n)
- Space Complexity: O(n) auxiliary space for subarrays during merge

Why Merge Sort?
Unlike QuickSort, which can degrade to O(n^2) when poor pivots are chosen, Merge Sort
guarantees predictable O(n log n) performance regardless of the initial order of complaints.
It is also a STABLE sort, preserving the relative order of complaints submitted at the same
timestamp.
"""

from typing import List, Dict, Any

def _merge(left: List[Dict[str, Any]], right: List[Dict[str, Any]], sort_key: str, reverse: bool) -> List[Dict[str, Any]]:
    """Merges two sorted lists into one sorted list."""
    merged = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        left_val = str(left[i].get(sort_key, ''))
        right_val = str(right[j].get(sort_key, ''))

        if reverse:
            # Descending order (newest first)
            condition = left_val >= right_val
        else:
            # Ascending order (oldest first)
            condition = left_val <= right_val

        if condition:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1

    # Append remaining elements from either half
    while i < len(left):
        merged.append(left[i])
        i += 1

    while j < len(right):
        merged.append(right[j])
        j += 1

    return merged

def merge_sort_complaints(
    complaints: List[Dict[str, Any]], 
    sort_key: str = 'created_at', 
    reverse: bool = True
) -> List[Dict[str, Any]]:
    """
    Recursively sorts complaint dictionaries using Merge Sort.

    Args:
        complaints: List of complaint records.
        sort_key: Field to sort by (e.g., 'created_at', 'journey_date', 'complaint_id').
        reverse: If True, sorts descending (e.g., newest to oldest). If False, sorts ascending.

    Returns:
        List[Dict[str, Any]]: A new sorted list of complaints.
    """
    # Base case: A list with 0 or 1 elements is already sorted
    if len(complaints) <= 1:
        return complaints

    # Divide: Find midpoint and partition the list into two halves
    mid = len(complaints) // 2
    left_half = merge_sort_complaints(complaints[:mid], sort_key=sort_key, reverse=reverse)
    right_half = merge_sort_complaints(complaints[mid:], sort_key=sort_key, reverse=reverse)

    # Conquer: Merge the two sorted halves
    return _merge(left_half, right_half, sort_key=sort_key, reverse=reverse)
