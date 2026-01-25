/**
 * List navigation and pagination utilities
 */

/**
 * Calculate visible items for paginated list display
 * Centers the selected item in the visible window
 */
export interface PaginationResult {
  /** Starting index in the full list */
  start: number;
  /** Ending index (exclusive) in the full list */
  end: number;
  /** Number of items above the visible window */
  itemsAbove: number;
  /** Number of items below the visible window */
  itemsBelow: number;
}

/**
 * Calculate pagination for a list with a selected index
 * @param totalItems - Total number of items in the list
 * @param selectedIndex - Currently selected item index
 * @param maxVisible - Maximum number of items to show at once
 * @returns Pagination information
 */
export function calculatePagination(
  totalItems: number,
  selectedIndex: number,
  maxVisible: number
): PaginationResult {
  if (totalItems <= maxVisible) {
    return {
      start: 0,
      end: totalItems,
      itemsAbove: 0,
      itemsBelow: 0,
    };
  }

  // Center the selected item in the visible window
  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(0, selectedIndex - halfVisible);

  // Ensure we don't go past the end
  if (start + maxVisible > totalItems) {
    start = totalItems - maxVisible;
  }

  const end = start + maxVisible;

  return {
    start,
    end,
    itemsAbove: start,
    itemsBelow: totalItems - end,
  };
}

/**
 * Move selection up in a list
 * @param currentIndex - Current selected index
 * @param minIndex - Minimum allowed index (default: 0)
 * @returns New index after moving up
 */
export function moveUp(currentIndex: number, minIndex = 0): number {
  return Math.max(minIndex, currentIndex - 1);
}

/**
 * Move selection down in a list
 * @param currentIndex - Current selected index
 * @param maxIndex - Maximum allowed index
 * @returns New index after moving down
 */
export function moveDown(currentIndex: number, maxIndex: number): number {
  return Math.min(maxIndex, currentIndex + 1);
}

/**
 * Clamp an index within valid bounds
 * @param index - Index to clamp
 * @param listLength - Length of the list
 * @returns Clamped index
 */
export function clampIndex(index: number, listLength: number): number {
  if (listLength === 0) return 0;
  return Math.max(0, Math.min(index, listLength - 1));
}

/**
 * Calculate max visible items based on available rows
 * @param availableRows - Total available rows
 * @param reservedRows - Rows reserved for headers, footers, etc.
 * @param minVisible - Minimum visible items (default: 5)
 * @returns Maximum visible items
 */
export function calculateMaxVisible(
  availableRows: number,
  reservedRows: number,
  minVisible = 5
): number {
  return Math.max(minVisible, availableRows - reservedRows);
}
