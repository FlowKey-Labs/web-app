import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { CustomPagination } from './CustomPagination';

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowClick?: (row: T) => void;
  className?: string;
  pageSize?: number;
  headerBg?: string;
  bodyBg?: string;
  rowHoverBg?: string;
  showPagination?: boolean;
  showHeaderDivider?: boolean;
  headerDividerColor?: string;
  paginateServerSide?: boolean;
  pageIndex?: number; // 1-based index from backend
  pageCount?: number;
  onPageChange?: (pageIndex: number) => void; // Expects 1-based index
}

const Table = <T extends object>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  className = '',
  pageSize = 10,
  headerBg = 'bg-tableHeader',
  bodyBg = '',
  rowHoverBg = 'hover:bg-flowkeySecondary',
  showPagination = true,
  showHeaderDivider = false,
  headerDividerColor = 'bg-gray-200',
  paginateServerSide = false,
  pageIndex = 1, // Default to 1 (first page)
  pageCount = 1,
  onPageChange,
}: TableProps<T>) => {
  // Convert 1-based backend index to 0-based for react-table
  const reactTablePageIndex = paginateServerSide ? pageIndex - 1 : undefined;

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: rowSelection || {},
      ...(paginateServerSide && {
        pagination: {
          pageIndex: reactTablePageIndex!,
          pageSize,
        },
      }),
    },
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: paginateServerSide ? pageCount : undefined,
    manualPagination: paginateServerSide,
  });

  const handlePageChange = (pageNumber: number) => {
    if (paginateServerSide) {
      onPageChange?.(pageNumber);
    } else {
      table.setPageIndex(pageNumber - 1);
    }
  };

  // Current page number to display (always 1-based)
  const currentPageNumber = paginateServerSide
    ? pageIndex
    : table.getState().pagination.pageIndex + 1;

  // Total number of pages
  const totalPages = paginateServerSide ? pageCount : table.getPageCount();

  return (
    <div className={`overflow-x-auto shadow-lg rounded-lg ${className}`}>
      <table className='min-w-full bg-white overflow-hidden'>
        <thead className={`${headerBg} h-[62px]`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className='px-6 py-3 text-xs text-start font-medium text-primary uppercase tracking-wider'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
          {showHeaderDivider && (
            <tr>
              <td
                colSpan={columns.length}
                className={`${headerDividerColor} h-[1px] p-0`}
              />
            </tr>
          )}
        </thead>
        <tbody className={`${bodyBg} divide-y divide-gray-200`}>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`
                ${rowHoverBg} 
                hover:scale-[1.01] 
                transition-all 
                duration-200 
                ${row.getIsSelected() ? 'bg-flowkeySecondary' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className='px-6 py-3 text-sm text-start text-primary'
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {showPagination && totalPages > 1 && (
          <tfoot>
            <tr>
              <td colSpan={columns.length} className='py-4'>
                <div className='w-full mx-auto border-t border-gray-200 mb-4' />
                <div className='px-6'>
                  <CustomPagination
                    totalPages={totalPages}
                    currentPage={currentPageNumber}
                    onPageChange={handlePageChange}
                    className='justify-center'
                  />
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default Table;
