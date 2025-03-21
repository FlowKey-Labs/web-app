import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  OnChangeFn,
  getPaginationRowModel,
} from '@tanstack/react-table';
import tableLeftIcon from '../../assets/icons/tableLeft.svg';
import tableRightIcon from '../../assets/icons/tableRight.svg';

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onRowClick?: (row: T) => void;
  className?: string;
  pageSize?: number;
}

const Table = <T extends object>({
  data,
  columns,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  className,
  pageSize = 10,
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: rowSelection || {},
    },
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div
      className={`overflow-x-auto shadow-lg rounded-t-lg rounded-b-3xl  ${
        className || ''
      }`}
    >
      <table className='min-w-full bg-white border border-gray-200 overflow-hidden'>
        <thead className='bg-tableHeader h-[62px]'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className='px-6 py-3 text-xs text-center font-medium text-primary uppercase tracking-wider'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className='divide-y divide-gray-200 '>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-flowkeySecondary hover:scale-[1.01] transition-all duration-200 ${
                row.getIsSelected() ? 'bg-flowkeySecondary' : ''
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-6 py-3 text-sm text-center text-primary ${
                    onRowClick && cell.column.id !== 'select'
                      ? 'cursor-pointer'
                      : ''
                  }`}
                  onClick={(e) => {
                    if (cell.column.id === 'select') {
                      e.stopPropagation();
                      return;
                    }
                    onRowClick?.(row.original);
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length} className='pb-4'>
              <div className='w-full mx-auto border-t border-gray-200 mb-4'></div>

              <div className='flex justify-between items-center px-6'>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className='flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs text-[#6D7172] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed '
                >
                  <img src={tableLeftIcon} alt='Previous' className='w-3 h-3' />
                </button>
                <div className='flex space-x-2'>
                  {Array.from(
                    { length: table.getPageCount() },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => table.setPageIndex(page - 1)}
                      className={`px-2 py-1 border border-gray-300 rounded-lg text-xs  ${
                        page === table.getState().pagination.pageIndex + 1
                          ? 'bg-[#DBDEDF] text-primary'
                          : 'text-[#6D7172] hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className='flex items-center px-2 py-2 border border-gray-300 rounded-lg text-xs text-[#6D7172] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed '
                >
                  <img src={tableRightIcon} alt='Next' className='w-3 h-3' />
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Table;
