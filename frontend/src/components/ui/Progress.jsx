function Progress({ className = '', value, max = 10, variant = 'default', ...props }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  let containerClasses = 'w-full bg-slate-200 rounded-full h-3 overflow-hidden'
  if (className) {
    containerClasses += ` ${className}`
  }
  
  let barClasses = 'h-full rounded-full transition-all duration-500 ease-out'
  if (variant === 'default') {
    barClasses += ' bg-gradient-to-r from-blue-500 to-purple-500'
  } else if (variant === 'success') {
    barClasses += ' bg-gradient-to-r from-emerald-500 to-green-500'
  } else if (variant === 'warning') {
    barClasses += ' bg-gradient-to-r from-amber-500 to-orange-500'
  } else if (variant === 'danger') {
    barClasses += ' bg-gradient-to-r from-red-500 to-pink-500'
  }
  
  return (
    <div className={containerClasses} {...props}>
      <div
        className={barClasses}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { Progress }