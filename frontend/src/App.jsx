import { Layout } from './components/layout/Layout'
import { PRAnalyzer } from './components/features/PRAnalyzer'
import { ResultsPanel } from './components/features/ResultsPanel'
import { SkeletonLoader } from './components/features/Skeletonloader'
import { useAnalyzePR } from './hooks/useAnalyzePR'

function App() {
  const { analyze, data, loading, error, reset } = useAnalyzePR()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Hero — hidden while loading or showing results */}
        {!loading && !data && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                GitHub PR Risk Analyzer
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Analyze GitHub pull requests with AI-powered risk assessment.
                Get instant insights on code quality, security vulnerabilities, and improvement recommendations.
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Security Focused</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        )}

        {/* Input — always visible */}
        <PRAnalyzer
          onAnalyze={analyze}
          loading={loading}
          error={error}
          onReset={reset}
          aiUnavailable={data?.ai_unavailable}
        />

        {/* Skeleton — while waiting for response */}
        {loading && <SkeletonLoader />}

        {/* Results */}
        {data && !loading && (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
            </div>
            <ResultsPanel results={data} />
          </>
        )}

      </div>
    </Layout>
  )
}

export default App