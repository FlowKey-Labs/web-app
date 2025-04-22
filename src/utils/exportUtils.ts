import { utils, writeFile } from 'xlsx';

/**
 * Converts JSON data to CSV format
 * @param data Array of objects to convert to CSV
 * @returns CSV string
 */
export const jsonToCsv = (data: any[]): string => {
  if (!data || !data.length) return '';
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Create data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle values with commas by wrapping in quotes
      return `"${value?.toString().replace(/"/g, '""') || ''}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Exports data to Excel or CSV file
 * @param data Data to export
 * @param type Export type ('csv' or 'excel')
 * @param filename Filename without extension
 * @param excludeFields Fields to exclude from export
 */
export const exportDataToFile = <T extends Record<string, any>>(
  data: T[],
  type: 'csv' | 'excel',
  filename: string,
  excludeFields: string[] = []
): void => {
  if (!data || !data.length) return;
  
  // Process data to exclude specified fields
  const exportData = data.map(item => {
    const newItem = { ...item };
    excludeFields.forEach(field => {
      delete newItem[field];
    });
    return newItem;
  });
  
  if (type === 'excel') {
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFile(wb, `${filename}.xlsx`);
  } else if (type === 'csv') {
    const csvData = jsonToCsv(exportData);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  }
};
