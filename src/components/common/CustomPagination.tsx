interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CustomPagination({
  totalPages,
  currentPage,
  onPageChange,
  className = '',
}: CustomPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className='flex items-center space-x-1 bg-white rounded-full shadow-sm p-1.5 border border-gray-100'>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='p-2 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          aria-label='Previous page'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M15 18l-6-6 6-6' />
          </svg>
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          const isCurrent = page === currentPage;
          const isNearCurrent = Math.abs(page - currentPage) <= 1;
          const isBoundary = page === 1 || page === totalPages;

          if (isCurrent || isNearCurrent || isBoundary) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#43D3FF] to-[#38B6FF] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {page}
              </button>
            );
          }

          if (page === currentPage + 2 || page === currentPage - 2) {
            return (
              <span key={page} className='px-2 text-gray-400'>
                ...
              </span>
            );
          }

          return null;
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='p-2 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
          aria-label='Next page'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M9 18l6-6-6-6' />
          </svg>
        </button>
      </div>

      <p className='mt-3 text-sm text-gray-500'>
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
