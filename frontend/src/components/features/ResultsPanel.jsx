import { useState } from "react"
import { RiskVisualization } from "./RiskVisualization"
import {
  CheckCircle,
  Lightbulb,
  Package,
  FileText,
  Sparkles,
  Copy,
  Check
} from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

export function ResultsPanel({ results }) {
  const risk_label = results?.risk_label || "LOW"
  const risk_score = results?.risk_score || 0
  const review = results?.review_comments || {}

  const risk_explanation = review?.risk_explanation || "Analysis completed"
  const mitigation_steps = review?.mitigation_steps || []
  const code_suggestions = review?.code_suggestions || []
  const dependencies = review?.dependencies || []

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Hero Section */}
      <div className="rounded-3xl bg-black p-12 border border-cyan-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          <h2 className="text-4xl font-black text-white">
            Security Report
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Risk Score" value={risk_score.toFixed(1)} color="cyan" />
          <StatCard title="Level" value={risk_label} color="purple" />
          <StatCard title="Actions" value={mitigation_steps.length} color="emerald" />
          <StatCard title="Issues" value={code_suggestions.length} color="orange" />
        </div>
      </div>

      {/* Risk Explanation */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">
            Risk Assessment
          </h3>
        </div>

        <RiskVisualization riskLabel={risk_label} riskScore={risk_score} />

        <p className="mt-4 text-sm text-cyan-100/80 leading-relaxed">
          {risk_explanation}
        </p>
      </div>

      {/* Mitigation Steps */}
      {mitigation_steps.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">
              Recommended Actions
            </h3>
          </div>

          <div className="space-y-3">
            {mitigation_steps.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
              >
                <p className="text-sm text-emerald-100/80">
                  {index + 1}. {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Suggestions */}
      {code_suggestions.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">
              Code Improvements
            </h3>
          </div>

          <div className="space-y-6">
            {code_suggestions.map((suggestion, index) => (
              <CodeBlock key={index} suggestion={suggestion} />
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-orange-400" />
            <h3 className="text-xl font-bold text-white">
              Dependencies
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {dependencies.map((dep, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-500/10 text-orange-300 rounded-lg text-xs border border-orange-500/30"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------ Helper Components ------------------ */

function StatCard({ title, value, color }) {
  const colors = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    orange: "text-orange-400 border-orange-500/30 bg-orange-500/10"
  }

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <p className="text-xs opacity-70">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function CodeBlock({ suggestion }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLong = suggestion?.content?.length > 400

  const handleCopy = async () => {
    await navigator.clipboard.writeText(suggestion.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (suggestion?.type !== "code") {
    return (
      <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
        <p className="text-sm text-purple-100/80 leading-relaxed">
          {suggestion?.content}
        </p>
      </div>
    )
  }

  return (
    <div className="relative p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-700/40 text-purple-200 uppercase">
          {suggestion.language || "code"}
        </span>

        <div className="flex items-center gap-4">
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-purple-300 hover:text-white transition"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-purple-300 hover:text-white transition"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={suggestion.language || "javascript"}
        style={oneDark}
        showLineNumbers
        wrapLongLines
        customStyle={{
          borderRadius: "1rem",
          padding: "1rem",
          fontSize: "0.8rem",
          margin: 0,
          maxHeight: !expanded && isLong ? "250px" : "none",
          overflowY: "auto",
          scrollbarWidth: "thin"
        }}
      >
        {suggestion.content}
      </SyntaxHighlighter>
    </div>
  )
}