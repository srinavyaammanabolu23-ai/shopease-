import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const delta = 2
    const range = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (currentPage - delta > 2) range.unshift('...')
    if (currentPage + delta < totalPages - 1) range.push('...')
    range.unshift(1)
    if (totalPages !== 1) range.push(totalPages)
    return range
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary btn-sm px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <HiChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? 'bg-primary-600 text-white shadow-sm'
                : 'btn-secondary'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary btn-sm px-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Pagination
