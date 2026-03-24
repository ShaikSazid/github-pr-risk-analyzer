function Badge({ className = '', variant = 'default', children, ...props }) {
  let badgeClasses = 'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset'
  
  if (variant === 'default') {
    badgeClasses += ' bg-slate-50 text-slate-700 ring-slate-600/20'
  } else if (variant === 'LOW') {
    badgeClasses += ' bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  } else if (variant === 'MEDIUM') {
    badgeClasses += ' bg-amber-50 text-amber-700 ring-amber-600/20'
  } else if (variant === 'HIGH') {
    badgeClasses += ' bg-red-50 text-red-700 ring-red-600/20'
  }
  
  if (className) {
    badgeClasses += ` ${className}`
  }

  return (
    <div className={badgeClasses} {...props}>
      {children}
    </div>
  )
}

export { Badge }