import { APP_CONFIG } from '../../config/constants'
import { Github } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {APP_CONFIG.name}
              </h1>
              <p className="text-xs text-slate-500">AI-Powered Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>v{APP_CONFIG.version}</span>
          </div>
        </div>
      </div>
    </header>
  )
}