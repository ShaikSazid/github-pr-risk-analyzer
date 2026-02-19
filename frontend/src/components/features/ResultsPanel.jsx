import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { RiskVisualization } from './RiskVisualization'
import { CheckCircle, Lightbulb, Package, FileText, Zap, Sparkles, ArrowRight } from 'lucide-react'

export function ResultsPanel({ results }) {
  const risk_label = results?.risk_label || 'LOW'
  const risk_score = results?.risk_score || 0
  const review = results?.review_comments || {}
  
  const risk_explanation = review?.risk_explanation || 'Analysis completed'
  const mitigation_steps = review?.mitigation_steps || []
  const code_suggestions = review?.code_suggestions || []
  const dependencies = review?.dependencies || []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Futuristic Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-black p-12 border border-cyan-500/30">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">AI Analysis Complete</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-2">Security Report</h2>
              <p className="text-cyan-300/80 text-sm">Real-time threat assessment & optimization</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="group p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/30 backdrop-blur-xl hover:border-cyan-500/60 transition-all duration-300 cursor-default">
              <p className="text-cyan-300/60 text-xs font-semibold mb-2 uppercase">Risk Score</p>
              <p className="text-4xl font-black text-cyan-400">{risk_score.toFixed(1)}</p>
              <p className="text-xs text-cyan-300/40 mt-1">out of 10</p>
            </div>
            <div className="group p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 backdrop-blur-xl hover:border-purple-500/60 transition-all duration-300 cursor-default">
              <p className="text-purple-300/60 text-xs font-semibold mb-2 uppercase">Level</p>
              <p className="text-4xl font-black text-purple-400">{risk_label}</p>
            </div>
            <div className="group p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/30 backdrop-blur-xl hover:border-emerald-500/60 transition-all duration-300 cursor-default">
              <p className="text-emerald-300/60 text-xs font-semibold mb-2 uppercase">Actions</p>
              <p className="text-4xl font-black text-emerald-400">{mitigation_steps.length}</p>
            </div>
            <div className="group p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/30 backdrop-blur-xl hover:border-orange-500/60 transition-all duration-300 cursor-default">
              <p className="text-orange-300/60 text-xs font-semibold mb-2 uppercase">Issues</p>
              <p className="text-4xl font-black text-orange-400">{code_suggestions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment - Neon Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 border border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/50 backdrop-blur-sm">
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
              <p className="text-xs text-cyan-300/60 mt-1">Detailed analysis</p>
            </div>
          </div>
          
          <RiskVisualization riskLabel={risk_label} riskScore={risk_score} />
          
          <div className="mt-6 p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/30 backdrop-blur-xl">
            <p className="text-sm text-cyan-100/80 leading-relaxed">
              {risk_explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Actions - Futuristic List */}
      {mitigation_steps && mitigation_steps.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 border border-emerald-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/50 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Recommended Actions</h3>
                <p className="text-xs text-emerald-300/60 mt-1">{mitigation_steps.length} critical steps</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {mitigation_steps.map((step, index) => (
                <div 
                  key={index}
                  className="group relative p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/30 backdrop-blur-xl hover:border-emerald-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-sm text-emerald-100/80 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Improvements - Neon Glow */}
      {code_suggestions && code_suggestions.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/50 backdrop-blur-sm">
                <Lightbulb className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Code Improvements</h3>
                <p className="text-xs text-purple-300/60 mt-1">{code_suggestions.length} optimization tips</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {code_suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="group p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 backdrop-blur-xl hover:border-purple-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <div className="flex gap-4">
                    <Lightbulb className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-100/80 leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dependencies - Tech Stack */}
      {dependencies && dependencies.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 border border-orange-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/50 backdrop-blur-sm">
                <Package className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Dependencies</h3>
                <p className="text-xs text-orange-300/60 mt-1">{dependencies.length} components</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {dependencies.map((dep, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-300 rounded-xl text-xs font-mono border border-orange-500/30 backdrop-blur-xl hover:border-orange-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 cursor-default"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stats - Futuristic */}
      <div className="grid grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 border border-emerald-400/50 shadow-2xl shadow-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <CheckCircle className="h-6 w-6 text-white/80 mb-3" />
            <p className="text-4xl font-black text-white">{mitigation_steps.length}</p>
            <p className="text-sm text-emerald-100 mt-2 font-semibold">Actions</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 border border-purple-400/50 shadow-2xl shadow-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <Lightbulb className="h-6 w-6 text-white/80 mb-3" />
            <p className="text-4xl font-black text-white">{code_suggestions.length}</p>
            <p className="text-sm text-purple-100 mt-2 font-semibold">Issues</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-red-600 p-6 border border-orange-400/50 shadow-2xl shadow-orange-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <Package className="h-6 w-6 text-white/80 mb-3" />
            <p className="text-4xl font-black text-white">{dependencies.length}</p>
            <p className="text-sm text-orange-100 mt-2 font-semibold">Deps</p>
          </div>
        </div>
      </div>
    </div>
  )
}