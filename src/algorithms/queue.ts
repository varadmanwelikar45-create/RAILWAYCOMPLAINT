import { Complaint } from '../types';

/**
 * Educational Queue implementation mirroring Python collections.deque FIFO
 * All core operations are O(1) constant time complexity.
 */
export class FIFOQueue {
  private items: Complaint[] = [];
  private queuedIds: Set<string> = new Set();

  constructor(initialItems: Complaint[] = []) {
    initialItems.forEach(item => this.enqueue(item));
  }

  enqueue(item: Complaint): boolean {
    if (!item || !item.complaintId) return false;
    if (this.queuedIds.has(item.complaintId)) return false; // Prevent duplicates

    this.items.push(item);
    this.queuedIds.add(item.complaintId);
    return true;
  }

  dequeue(): Complaint | null {
    if (this.items.length === 0) return null;
    const removed = this.items.shift() || null;
    if (removed) {
      this.queuedIds.delete(removed.complaintId);
    }
    return removed;
  }

  peek(): Complaint | null {
    return this.items.length > 0 ? this.items[0] : null;
  }

  removeById(complaintId: string): boolean {
    if (!this.queuedIds.has(complaintId)) return false;
    this.items = this.items.filter(i => i.complaintId !== complaintId);
    this.queuedIds.delete(complaintId);
    return true;
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  getItems(): Complaint[] {
    return [...this.items];
  }
}
