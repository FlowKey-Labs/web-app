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

  // Server-side pagination controls
  paginateServerSide?: boolean;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (pageIndex: number) => void;
}

const Table = <T extends object>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  className,
  pageSize = 10,
  headerBg = 'bg-tableHeader',
  bodyBg,
  rowHoverBg = 'hover:bg-flowkeySecondary',
  showPagination = true,
  showHeaderDivider = false,
  headerDividerColor = 'bg-gray-200',
  paginateServerSide = false,
  pageIndex = 0,
  pageCount,
  onPageChange,
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: rowSelection || {},
      pagination: paginateServerSide ? { pageIndex, pageSize } : undefined,
    },
    onRowSelectionChange,
    pageCount: paginateServerSide ? pageCount : undefined,
    manualPagination: paginateServerSide,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={`overflow-x-auto shadow-lg rounded-lg ${className || ''}`}>
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
              <td colSpan={columns.length} className={`${headerDividerColor} h-[1px] p-0`}></td>
            </tr>
          )}
        </thead>
        <tbody className={`${bodyBg} divide-y divide-gray-200`}>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`${rowHoverBg} hover:scale-[1.01] transition-all duration-200 ${
                row.getIsSelected() ? 'bg-flowkeySecondary' : ''
              } ${onRowClick ? 'cursor-pointer' : ''}`}
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
                        : !table.getCanPreviousPage()
                    }
                    className="flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs text-[#6D7172] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img src={tableLeftIcon} alt="Previous" className="w-3 h-3" />
                  </button>

                  <div className="flex space-x-2">
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
                            ? 'bg-[#DBDEDF] text-primary'
                            : 'text-[#6D7172] hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      paginateServerSide
                        ? onPageChange?.(pageIndex + 1)
                        : table.nextPage()
                    }
                    disabled={
                      paginateServerSide
                        ? pageIndex >= (pageCount ?? 1) - 1
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
