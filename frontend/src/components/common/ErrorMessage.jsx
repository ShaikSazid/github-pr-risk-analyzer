import { AlertCircle } from 'lucide-react'

export function ErrorMessage({ message, className = '' }) {
  let containerClasses = 'flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-200 rounded-xl animate-scale-in'
  if (className) {
    containerClasses += ` ${className}`
  }

  return (
    <div className={containerClasses}>
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}