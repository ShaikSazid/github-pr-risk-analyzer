import { forwardRef } from 'react'

const Button = forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  let buttonClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]'
  
  if (variant === 'primary') {
    buttonClasses += ' bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl focus-visible:ring-blue-500'
  } else if (variant === 'secondary') {
    buttonClasses += ' bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md focus-visible:ring-slate-500'
  } else if (variant === 'outline') {
    buttonClasses += ' border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500'
  } else if (variant === 'ghost') {
    buttonClasses += ' text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-500'
  }
  
  if (size === 'sm') {
    buttonClasses += ' h-9 px-4 text-sm'
  } else if (size === 'md') {
    buttonClasses += ' h-11 px-6 text-sm'
  } else if (size === 'lg') {
    buttonClasses += ' h-13 px-8 text-base'
  }
  
  if (className) {
    buttonClasses += ` ${className}`
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }