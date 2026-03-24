export function Footer() {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-red-500">❤️</span>
            <span className="text-sm">Built for better code reviews</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Real-time Analysis</span>
            <span>•</span>
            <span>Security Focused</span>
          </div>
        </div>
      </div>
    </footer>
  )
}