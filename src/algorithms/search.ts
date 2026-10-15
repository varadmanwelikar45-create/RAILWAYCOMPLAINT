import { Complaint } from '../types';

export interface SearchResult {
  matches: Complaint[];
  elementsExamined: number;
  timeTakenMs: number;
}

/**
 * Linear Search algorithm mirroring Python data_structures/search.py
 * Sequentially tests each record (O(n) time complexity).
 */
export function executeLinearSearch(
  complaints: Complaint[],
  query: string
): SearchResult {
  const startTime = performance.now();
  if (!query || query.trim() === '') {
    return {
      matches: complaints,
      elementsExamined: 0,
      timeTakenMs: 0,
    };
  }

  const cleanQuery = query.trim().toLowerCase();
  const matches: Complaint[] = [];
  let elementsExamined = 0;

  for (let i = 0; i < complaints.length; i++) {
    elementsExamined++;
    const c = complaints[i];
    if (!c) continue;

    const cId = String(c.complaintId || '').toLowerCase();
    const pName = String(c.passengerName || '').toLowerCase();
    const train = String(c.trainNumber || '').toLowerCase();
    const pnr = String(c.pnrNumber || '').toLowerCase();

    if (
      cId.includes(cleanQuery) ||
      pName.includes(cleanQuery) ||
      train.includes(cleanQuery) ||
      pnr.includes(cleanQuery)
    ) {
      matches.push(c);
    }
  }

  const endTime = performance.now();
  return {
    matches,
    elementsExamined,
    timeTakenMs: Number((endTime - startTime).toFixed(3)),
  };
}
