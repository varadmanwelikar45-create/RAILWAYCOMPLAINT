"""
RailCare - Linear Search Algorithm Implementation
Searches through a collection (list of complaint dictionaries) to locate records matching
a given search query (by Complaint ID or Passenger Full Name).

Time Complexity Analysis:
- Best Case: O(1) [Target item found at index 0]
- Average Case: O(n/2) = O(n) [Target found in middle of collection]
- Worst Case: O(n) [Target is at the end or does not exist, examining all n elements]
- Space Complexity: O(k) auxiliary where k is the number of matching records found.

Why Linear Search here?
For unsorted collections or multi-attribute searches (matching both ID or substring of
passenger name), linear search evaluates each record sequentially without requiring
strict sorted array invariants.
"""

from typing import List, Dict, Any

def linear_search_complaints(
    complaints: List[Dict[str, Any]], 
    query: str, 
    match_partial: bool = True
) -> List[Dict[str, Any]]:
    """
    Search a list of complaint dictionaries for matches against complaint_id or passenger_name.

    Args:
        complaints: List of complaint dictionary records.
        query: Search string entered by passenger or admin.
        match_partial: If True, performs case-insensitive substring matching.
                       If False, performs exact string comparison.

    Returns:
        List[Dict[str, Any]]: A list of matching complaint records.
    """
    if not query:
        return complaints

    cleaned_query = query.strip().lower()
    matches = []

    # Sequential iteration: evaluates each record one by one (O(n))
    for complaint in complaints:
        c_id = str(complaint.get('complaint_id', '')).strip().lower()
        passenger_name = str(complaint.get('passenger_name', '')).strip().lower()
        train_number = str(complaint.get('train_number', '')).strip().lower()
        pnr_number = str(complaint.get('pnr_number', '')).strip().lower()

        if match_partial:
            if (cleaned_query in c_id or 
                cleaned_query in passenger_name or 
                cleaned_query in train_number or 
                cleaned_query in pnr_number):
                matches.append(complaint)
        else:
            if cleaned_query == c_id or cleaned_query == passenger_name:
                matches.append(complaint)

    return matches
