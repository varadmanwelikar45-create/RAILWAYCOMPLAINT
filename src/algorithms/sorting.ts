import { Complaint } from '../types';

export interface SortResult {
  sortedList: Complaint[];
  comparisons: number;
  timeTakenMs: number;
}

/**
 * Merge Sort implementation mirroring Python data_structures/sorting.py
 * Divide and conquer with guaranteed O(n log n) time complexity.
 */
function merge(
  left: Complaint[],
  right: Complaint[],
  sortKey: keyof Complaint,
  reverse: boolean,
  counter: { comparisons: number }
): Complaint[] {
  const result: Complaint[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    counter.comparisons++;
    const leftItem = left[i];
    const rightItem = right[j];
    const leftVal = leftItem ? String(leftItem[sortKey] ?? '') : '';
    const rightVal = rightItem ? String(rightItem[sortKey] ?? '') : '';

    const condition = reverse ? leftVal >= rightVal : leftVal <= rightVal;

    if (condition) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

function mergeSortHelper(
  list: Complaint[],
  sortKey: keyof Complaint,
  reverse: boolean,
  counter: { comparisons: number }
): Complaint[] {
  if (list.length <= 1) {
    return list;
  }

  const mid = Math.floor(list.length / 2);
  const left = mergeSortHelper(list.slice(0, mid), sortKey, reverse, counter);
  const right = mergeSortHelper(list.slice(mid), sortKey, reverse, counter);

  return merge(left, right, sortKey, reverse, counter);
}

export function executeMergeSort(
  complaints: Complaint[],
  sortKey: keyof Complaint = 'createdAt',
  reverse: boolean = true
): SortResult {
  const startTime = performance.now();
  const counter = { comparisons: 0 };
  const sortedList = mergeSortHelper([...complaints], sortKey, reverse, counter);
  const endTime = performance.now();

  return {
    sortedList,
    comparisons: counter.comparisons,
    timeTakenMs: Number((endTime - startTime).toFixed(3)),
  };
}
