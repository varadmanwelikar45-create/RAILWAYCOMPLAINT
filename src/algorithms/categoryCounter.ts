import { Complaint, ComplaintCategory } from '../types';
import { ALLOWED_CATEGORIES } from '../data/mockData';

/**
 * Category-wise frequency distribution using Dictionary (Hash Map)
 * O(n) total time, O(1) average hash insertion.
 */
export function countByCategory(complaints: Complaint[]): Record<ComplaintCategory, number> {
  const counts = ALLOWED_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<ComplaintCategory, number>);

  for (const c of (complaints || [])) {
    if (c && c.category && c.category in counts) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
  }

  return counts;
}

export function countByStatus(complaints: Complaint[]): {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
} {
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;

  for (const c of (complaints || [])) {
    if (!c) continue;
    if (c.status === 'Pending') pending++;
    else if (c.status === 'In Progress') inProgress++;
    else if (c.status === 'Resolved') resolved++;
  }

  return {
    total: (complaints || []).filter(Boolean).length,
    pending,
    inProgress,
    resolved,
  };
}
