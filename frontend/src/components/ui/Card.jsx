import { forwardRef } from 'react'

const Card = forwardRef(({ className = '', children, ...props }, ref) => {
  const cardClasses = `glass-card rounded-2xl shadow-xl ${className}`
  
  return (
    <div ref={ref} className={cardClasses} {...props}>
      {children}
    </div>
  )
})

const CardHeader = forwardRef(({ className = '', children, ...props }, ref) => {
  const headerClasses = `flex flex-col space-y-2 p-6 pb-4 ${className}`
  
  return (
    <div ref={ref} className={headerClasses} {...props}>
      {children}
    </div>
  )
})

const CardTitle = forwardRef(({ className = '', children, ...props }, ref) => {
  const titleClasses = `text-xl font-semibold text-slate-900 ${className}`
  
  return (
    <h3 ref={ref} className={titleClasses} {...props}>
      {children}
    </h3>
  )
})

const CardContent = forwardRef(({ className = '', children, ...props }, ref) => {
  const contentClasses = `p-6 pt-0 ${className}`
  
  return (
    <div ref={ref} className={contentClasses} {...props}>
      {children}
    </div>
  )
})

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }