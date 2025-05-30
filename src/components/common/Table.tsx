import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
} from '@tanstack/react-table';
import tableLeftIcon from '../../assets/icons/tableLeft.svg';
import tableRightIcon from '../../assets/icons/tableRight.svg';

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowClick?: (row: T) => void;
  className?: string;
  pageSize?: number;

  // Appearance
  headerBg?: string;
  bodyBg?: string;
  rowHoverBg?: string;
  showPagination?: boolean;
  showHeaderDivider?: boolean;
  headerDividerColor?: string;
<<<<<<< Updated upstream

  // Server-side pagination controls
  paginateServerSide?: boolean;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (pageIndex: number) => void;
=======
  paginateServerSide?: boolean;
  pageIndex?: number; // 1-based index from backend
  pageCount?: number;
  onPageChange?: (pageIndex: number) => void; // Expects 1-based index
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  pageIndex = 0,
  pageCount,
=======
  pageIndex = 1, // Default to 1 (first page)
  pageCount = 1,
>>>>>>> Stashed changes
  onPageChange,
}: TableProps<T>) => {
  const reactTablePageIndex = paginateServerSide ? pageIndex - 1 : 0;

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: rowSelection || {},
<<<<<<< Updated upstream
      pagination: paginateServerSide ? { pageIndex, pageSize } : undefined,
=======
      pagination: {
        pageIndex: reactTablePageIndex,
        pageSize,
      },
>>>>>>> Stashed changes
    },
    onRowSelectionChange,
    pageCount: paginateServerSide ? pageCount : undefined,
    manualPagination: paginateServerSide,
    getCoreRowModel: getCoreRowModel(),
<<<<<<< Updated upstream
    initialState: {
      pagination: {
        pageSize,
      },
    },
=======
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: paginateServerSide ? pageCount : undefined,
    manualPagination: paginateServerSide,
>>>>>>> Stashed changes
  });

  const handlePreviousPage = () => {
    if (paginateServerSide) {
      const newPage = Math.max(pageIndex - 1, 1);
      onPageChange?.(newPage);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (paginateServerSide) {
      const newPage = Math.min(pageIndex + 1, pageCount);
      onPageChange?.(newPage);
    } else {
      table.nextPage();
    }
  };

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
  const totalPages = paginateServerSide
    ? pageCount
    : table.getPageCount();

  return (
<<<<<<< Updated upstream
    <div className={`overflow-x-auto shadow-lg rounded-lg ${className || ''}`}>
=======
    <div className={`overflow-x-auto shadow-lg rounded-lg ${className}`}>
>>>>>>> Stashed changes
      <table className="min-w-full bg-white overflow-hidden">
        <thead className={`${headerBg} h-[62px]`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-xs text-start font-medium text-primary uppercase tracking-wider"
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
                  className="px-6 py-3 text-sm text-start text-primary"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

<<<<<<< Updated upstream
        {showPagination && (
          <tfoot>
            <tr>
              <td colSpan={columns.length} className="pb-4">
                <div className="w-full mx-auto border-t border-gray-200 mb-4"></div>

                <div className="flex justify-between items-center px-6">
                  <button
                    onClick={() =>
                      paginateServerSide
                        ? onPageChange?.(pageIndex - 1)
                        : table.previousPage()
                    }
                    disabled={
                      paginateServerSide
                        ? pageIndex <= 0
=======
        {showPagination && totalPages > 1 && (
          <tfoot>
            <tr>
              <td colSpan={columns.length} className="pb-4">
                <div className="w-full mx-auto border-t border-gray-200 mb-4" />

                <div className="flex justify-between items-center px-6">
                  <button
                    onClick={handlePreviousPage}
                    disabled={
                      paginateServerSide
                        ? pageIndex <= 1
>>>>>>> Stashed changes
                        : !table.getCanPreviousPage()
                    }
                    className="flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs text-[#6D7172] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src={tableLeftIcon} alt="Previous" className="w-3 h-3" />
                  </button>

                  <div className="flex space-x-2">
<<<<<<< Updated upstream
                    {Array.from(
                      {
                        length: paginateServerSide
                          ? pageCount || 0
                          : table.getPageCount(),
                      },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() =>
                          paginateServerSide
                            ? onPageChange?.(page - 1)
                            : table.setPageIndex(page - 1)
                        }
                        className={`px-2 py-1 border border-gray-300 rounded-lg text-xs ${
                          page === (paginateServerSide ? pageIndex + 1 : table.getState().pagination.pageIndex + 1)
=======
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 py-1 border border-gray-300 rounded-lg text-xs ${
                          page === currentPageNumber
>>>>>>> Stashed changes
                            ? 'bg-[#DBDEDF] text-primary'
                            : 'text-[#6D7172] hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
<<<<<<< Updated upstream
                    onClick={() =>
                      paginateServerSide
                        ? onPageChange?.(pageIndex + 1)
                        : table.nextPage()
                    }
                    disabled={
                      paginateServerSide
                        ? pageIndex >= (pageCount ?? 1) - 1
=======
                    onClick={handleNextPage}
                    disabled={
                      paginateServerSide
                        ? pageIndex >= pageCount
>>>>>>> Stashed changes
                        : !table.getCanNextPage()
                    }
                    className="flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs text-[#6D7172] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src={tableRightIcon} alt="Next" className="w-3 h-3" />
                  </button>
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