import { useMemo, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileCode2,
  Zap,
  Info
} from "lucide-react"

const decodeEscapedText = (text = "") => {
  if (!text) return "";
  
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r")
    .trim()
}

const stripMarkdown = (text = "") => text.replace(/\\/g, "").replace(/`/g, "")

const normalizeLanguage = (lang) => {
  if (!lang) return "text"
  const supported = ["javascript", "typescript", "python", "go", "java", "json", "yaml", "bash", "cpp", "c"]
  return supported.includes(lang.toLowerCase()) ? lang.toLowerCase() : "text"
}

const ScrollbarStyles = () => (
  <style>{`
    .sleek-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }
    .sleek-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .sleek-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      transition: background 0.2s ease;
    }
    .sleek-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    /* For Firefox */
    .sleek-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
  `}</style>
)


function Section({ icon, title, children, delay = "" }) {
  return (
    <div className={`bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden animate-slide-up ${delay} flex flex-col h-full shadow-sm`}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-white/40">
        <div className="flex items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-200/60 flex-shrink-0">
          {icon}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      <div className="p-6 md:p-8 flex-grow">
        {children}
      </div>
    </div>
  )
}

function StatCard({ title, value, color = "blue", icon: Icon }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100 ring-blue-50",
    green: "text-emerald-600 bg-emerald-50/50 border-emerald-100 ring-emerald-50",
    orange: "text-amber-600 bg-amber-50/50 border-amber-100 ring-amber-50",
    red: "text-rose-600 bg-rose-50/50 border-rose-100 ring-rose-50"
  }

  return (
    <div className={`relative p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 ring-4 ${colorMap[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          {Icon && <Icon size={20} />}
        </div>
      </div>
    </div>
  )
}

function ImprovementItem({ issue }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const decodedCode = useMemo(() => decodeEscapedText(issue.code_example || ""), [issue.code_example])
  const safeLanguage = normalizeLanguage(issue.language)
  const isLong = decodedCode.split("\n").length > 12

  const handleCopy = async () => {
    if (!decodedCode) return
    await navigator.clipboard.writeText(decodedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group/item relative pl-6 space-y-4">
      <div className="absolute -left-[3px] top-2.5 w-1.5 h-1.5 bg-slate-300 rounded-full group-hover/item:bg-blue-400 transition-colors" />
      
      <div className="text-slate-700 leading-relaxed text-[15px] font-medium break-words">
        {issue.description}
      </div>

      {decodedCode && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-[#1a1b26] shadow-xl animate-scale-in">
          <div className="flex justify-between items-center px-4 py-3 bg-[#16161e] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                {safeLanguage}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isLong && (
                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-slate-400 hover:text-white transition-colors bg-white/5 rounded-md uppercase cursor-pointer">
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {expanded ? "Collapse" : "Expand"}
                </button>
              )}
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-slate-400 hover:text-white transition-colors bg-white/5 rounded-md uppercase cursor-pointer">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <SyntaxHighlighter
            language={safeLanguage}
            style={oneDark}
            showLineNumbers
            wrapLongLines
            className="sleek-scrollbar"
            customStyle={{
              margin: 0,
              padding: '20px',
              fontSize: "0.85rem",
              maxHeight: !expanded && isLong ? "320px" : "none",
              background: 'transparent',
            }}
          >
            {decodedCode}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}

export function ResultsPanel({ results }) {
  const review = results?.review_comments || {}
  const riskExplanation = review.risk_explanation || ""
  const mitigationSteps = review.mitigation_steps || []
  const fileReviews = review.file_reviews || []
  
  const riskScore = results?.risk_score ?? 0 
  const riskLabel = results?.risk_label ?? "LOW"
  const prUrl = results?.pr_url || "#"

  const totalIssuesCount = useMemo(() => {
    return fileReviews.reduce((acc, file) => acc + (file.issues?.length || 0), 0)
  }, [fileReviews])

  const getRiskColor = (label) => {
    switch (label?.toUpperCase()) {
      case "HIGH": return "red"
      case "MEDIUM": return "orange"
      case "LOW": return "green"
      default: return "blue"
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-12 min-h-screen selection:bg-blue-100">
      <ScrollbarStyles />
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black tracking-widest mb-4 border border-blue-100 uppercase">
               <Zap size={12} fill="currentColor" /> AI Analysis Engine
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                PR Security <span className="text-blue-600">Review</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Deep inspection and mitigation strategy for active PR.</p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up">
        <StatCard title="Security Risk" value={riskScore.toFixed(1)} color={getRiskColor(riskLabel)} icon={Shield} />
        <StatCard title="Risk Rating" value={riskLabel} color={getRiskColor(riskLabel)} icon={AlertTriangle} />
        <StatCard title="Action Items" value={mitigationSteps.length} color="orange" icon={CheckCircle2} />
        <StatCard title="Key Findings" value={totalIssuesCount} color="blue" icon={Code2} />
      </div>

      <div className="grid grid-cols-1 gap-10">
        {riskExplanation && (
           <div className="relative animate-slide-up delay-75 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-10"></div>
              
              <div className="relative bg-white/70 backdrop-blur-xl border border-blue-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Info size={24} className="text-white" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">
                      Executive Summary
                    </h3>
                    <p className="text-slate-700 text-[15px] font-semibold leading-relaxed italic">
                      {riskExplanation}
                    </p>
                  </div>
                </div>
              </div>
           </div>
        )}
        {mitigationSteps.length > 0 && (
          <Section delay="delay-150" icon={<AlertTriangle className="text-amber-500" size={18} />} title="Mitigation Strategy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
              {mitigationSteps.map((step, i) => (
                <div key={i} className="group flex gap-5 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    {i + 1}
                  </div>
                  <div className="text-slate-600 text-[14px] leading-relaxed font-medium break-words w-full overflow-hidden">
                    {stripMarkdown(step)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
        {fileReviews.length > 0 && (
          <Section delay="delay-300" icon={<Code2 className="text-blue-500" size={18} />} title="File Level Analysis">
            <div className="space-y-12">
              {fileReviews.map((review, fIndex) => (
                <div key={fIndex} className="relative pl-10 border-l-2 border-slate-100 last:border-transparent">
                  <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-white border-4 border-blue-600 rounded-full shadow-sm ring-4 ring-blue-50" />
                  
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold tracking-tight shadow-lg shadow-slate-200">
                      <FileCode2 size={14} className="text-blue-400" />
                      {review.file}
                    </div>

                    <div className="space-y-10">
                      {review.issues?.map((issue, iIndex) => (
                        <ImprovementItem key={iIndex} issue={issue} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}