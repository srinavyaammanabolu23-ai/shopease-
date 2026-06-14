import { HiStar } from 'react-icons/hi2'
import { HiStar as HiStarOutline } from 'react-icons/hi'

const StarRating = ({
  rating = 0,
  count = null,
  size = 'md',
  interactive = false,
  onChange = null,
  className = '',
}) => {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  const renderStar = (index) => {
    const filled = rating >= index
    const half = !filled && rating >= index - 0.5

    return (
      <button
        key={index}
        type={interactive ? 'button' : undefined}
        onClick={interactive && onChange ? () => onChange(index) : undefined}
        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        aria-label={interactive ? `Rate ${index} stars` : undefined}
        disabled={!interactive}
      >
        <HiStar
          className={`${sizes[size]} transition-colors ${
            filled || half ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {rating > 0 && (
        <span className={`font-semibold text-gray-700 dark:text-gray-300 ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className={`text-gray-500 dark:text-gray-400 ${textSizes[size]}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}

export default StarRating
