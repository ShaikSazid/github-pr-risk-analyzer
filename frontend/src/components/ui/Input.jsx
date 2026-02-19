import { forwardRef } from 'react'

const Input = forwardRef(({ 
  className = '', 
  type = 'text', 
  error, 
  ...props 
}, ref) => {
  let inputClasses = 'flex h-12 w-full rounded-xl border bg-white/50 backdrop-blur-sm px-4 py-3 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200'
  
  if (error) {
    inputClasses += ' border-red-300 focus:ring-red-500 bg-red-50/50'
  } else {
    inputClasses += ' border-slate-200 focus:ring-blue-500 hover:border-slate-300'
  }
  
  if (className) {
    inputClasses += ` ${className}`
  }

  return (
    <div className="w-full">
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }