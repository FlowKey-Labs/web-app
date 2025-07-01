import { Client } from '../types/clientTypes';

export interface TableClient extends Client {
  id: number;
  [key: string]: any;
}

/**
 * Gets selected client IDs from row selection
 * @param selection Row selection state from react-table
 * @param clients Array of clients
 * @returns Array of selected client IDs
 */
export const getSelectedClientIds = (
  selection: Record<string, boolean>,
  clients: TableClient[]
): number[] => {
  if (!clients || !selection) return [];

  const selectedRowIndices = Object.entries(selection)
    .filter(([_, isSelected]) => isSelected === true)
    .map(([rowId]) => parseInt(rowId, 10));

  return selectedRowIndices
    .map((rowIndex) => {
      if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= clients.length) {
        return null;
      }
      return clients[rowIndex]?.id;
    })
    .filter((id): id is number => id !== null);
};

/**
 * Gets selected client IDs with fallback to a selected client
 * @param selection Row selection state from react-table
 * @param clients Array of clients
 * @param selectedClient Currently selected client (optional)
 * @returns Array of selected client IDs
 */
export const getSelectedClientIdsWithFallback = (
  selection: Record<string, boolean>,
  clients: TableClient[],
  selectedClient?: TableClient | null
): number[] => {
  const selectedIds = getSelectedClientIds(selection, clients);
  
  // If no rows are selected but we have a selected client, use that
  if (selectedIds.length === 0 && selectedClient?.id) {
    return [selectedClient.id];
  }
  
  return selectedIds;
};
