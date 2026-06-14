const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  }

  const colors = {
    primary: 'border-primary-200 border-t-primary-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
    accent: 'border-accent-200 border-t-accent-600',
  }

  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin ${className}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner
