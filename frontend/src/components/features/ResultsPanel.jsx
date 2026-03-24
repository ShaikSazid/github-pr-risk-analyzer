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
  FileCode2,
  Zap,
  TrendingUp,
  CircleDot,
} from "lucide-react"


const decodeEscapedText = (text = "") => {
  if (!text) return ""
  return text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r").trim()
}

const stripMarkdown = (text = "") => text.replace(/\\/g, "").replace(/`/g, "")

const LANGUAGE_MAP = {
  javascript: "javascript", js: "javascript", jsx: "javascript",
  typescript: "typescript", ts: "typescript", tsx: "typescript",
  html: "html", htm: "html",
  css: "css", scss: "css", sass: "css", less: "css",
  vue: "jsx", svelte: "jsx",
  python: "python", py: "python",
  go: "go", golang: "go",
  java: "java",
  kotlin: "kotlin", kt: "kotlin",
  scala: "scala",
  c: "c",
  cpp: "cpp", "c++": "cpp", cc: "cpp",
  csharp: "csharp", cs: "csharp",
  rust: "rust", rs: "rust",
  swift: "swift",
  ruby: "ruby", rb: "ruby",
  php: "php",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash",
  json: "json",
  yaml: "yaml", yml: "yaml",
  toml: "toml",
  xml: "xml",
  sql: "sql",
  graphql: "graphql", gql: "graphql",
  markdown: "markdown", md: "markdown",
  dockerfile: "docker",
  text: "text", txt: "text", code: "text",
}

const normalizeLanguage = (lang) => {
  if (!lang) return "text"
  return LANGUAGE_MAP[lang.toLowerCase().trim()] || "text"
}


const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

    .rp-root { font-family: 'DM Sans', sans-serif; }
    .rp-mono { font-family: 'JetBrains Mono', monospace; }

    .sleek-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .sleek-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .sleek-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
    .sleek-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
    .sleek-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }

    .rp-stat-card:hover { transform: translateY(-2px); }
    .rp-step-card:hover .rp-step-bar { opacity: 1 !important; }
    .rp-step-card:hover { border-color: #e2e8f0; }

    @keyframes rp-fade-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .rp-fade-up { animation: rp-fade-up 0.4s ease both; }
    .rp-delay-1 { animation-delay: 80ms; }
    .rp-delay-2 { animation-delay: 160ms; }
    .rp-delay-3 { animation-delay: 240ms; }
    .rp-delay-4 { animation-delay: 320ms; }
  `}</style>
)


const riskConfig = {
  HIGH:    {
    bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",
    dot: "bg-red-500",   bar: "bg-red-500",         accentBar: "bg-red-400",
    numBg: "bg-red-50",  numBorder: "border-red-200", numText: "text-red-500",
  },
  MEDIUM:  {
    bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",
    dot: "bg-amber-500", bar: "bg-amber-400",       accentBar: "bg-amber-400",
    numBg: "bg-amber-50", numBorder: "border-amber-200", numText: "text-amber-500",
  },
  LOW:     {
    bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200",
    dot: "bg-emerald-500", bar: "bg-emerald-500",  accentBar: "bg-emerald-400",
    numBg: "bg-emerald-50", numBorder: "border-emerald-200", numText: "text-emerald-500",
  },
  DEFAULT: {
    bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",
    dot: "bg-blue-500",  bar: "bg-blue-500",        accentBar: "bg-blue-400",
    numBg: "bg-blue-50", numBorder: "border-blue-200", numText: "text-blue-500",
  },
}
const getRisk = (label) => riskConfig[label?.toUpperCase()] || riskConfig.DEFAULT


function StatCard({ label, value, risk, icon: Icon, delay = "" }) {
  const rc = risk ? getRisk(risk) : null
  return (
    <div className={`rp-stat-card rp-fade-up ${delay} bg-white border border-slate-200 rounded-2xl p-5 transition-all duration-200 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-xl ${rc ? rc.bg : "bg-slate-50"} border ${rc ? rc.border : "border-slate-200"}`}>
          <Icon size={16} className={rc ? rc.text : "text-slate-500"} />
        </div>
        {rc && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${rc.bg} border ${rc.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
            <span className={`rp-mono text-[10px] font-bold tracking-widest uppercase ${rc.text}`}>{risk}</span>
          </div>
        )}
      </div>
      <p className="rp-mono text-[28px] font-bold text-slate-900 leading-none tracking-tight">{value}</p>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-2">{label}</p>
    </div>
  )
}


function Section({ icon: Icon, iconColor = "text-slate-500", title, meta, children, delay = "" }) {
  return (
    <div className={`rp-fade-up ${delay} bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Icon size={15} className={iconColor} />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h2>
        </div>
        {meta && (
          <span className="rp-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
            {meta}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}


function ExecutiveSummary({ text, riskLabel }) {
  const rc = getRisk(riskLabel)
  return (
    <div className={`rp-fade-up rp-delay-1 border rounded-2xl overflow-hidden shadow-sm ${rc.border}`}>
      <div className={`h-[3px] w-full ${rc.bar}`} />
      <div className="bg-white px-6 py-6 flex gap-5">
        <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center`}>
          <TrendingUp size={14} className={rc.text} />
        </div>
        <div className="space-y-1.5">
          <p className={`rp-mono text-[10px] font-bold uppercase tracking-[0.18em] ${rc.text}`}>Executive Summary</p>
          <p className="text-slate-700 text-[15px] font-normal leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}


function MitigationStep({ text, index, rc }) {
  return (
    <div className="rp-step-card group relative flex gap-4 p-5 rounded-xl bg-slate-50/70 border border-slate-100 transition-all duration-200 overflow-hidden">
      <div className={`rp-step-bar absolute left-0 top-0 bottom-0 w-[2px] ${rc.accentBar} opacity-40 transition-opacity duration-200 rounded-l-xl`} />
      <div className={`rp-mono flex-shrink-0 w-6 h-6 mt-0.5 rounded-md ${rc.numBg} border ${rc.numBorder} flex items-center justify-center text-[11px] font-bold ${rc.numText} shadow-sm`}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <p className="text-slate-600 text-[13.5px] leading-[1.75] font-normal">{stripMarkdown(text)}</p>
    </div>
  )
}


function CodeBlock({ code, language }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const decoded = useMemo(() => decodeEscapedText(code), [code])
  const lang = normalizeLanguage(language)
  const displayLang = language?.toLowerCase().trim() || "text"
  const isLong = decoded.split("\n").length > 12

  const handleCopy = async () => {
    await navigator.clipboard.writeText(decoded)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-[#0d1117] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/25 border border-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/25 border border-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/40" />
          </div>
          <span className="rp-mono text-[10px] text-slate-400 tracking-widest uppercase">{displayLang}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="rp-mono flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="rp-mono flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-200 bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        showLineNumbers
        wrapLongLines
        className="sleek-scrollbar"
        customStyle={{
          margin: 0,
          padding: "18px 20px",
          fontSize: "0.82rem",
          lineHeight: "1.65",
          maxHeight: !expanded && isLong ? "300px" : "none",
          background: "transparent",
        }}
      >
        {decoded}
      </SyntaxHighlighter>
    </div>
  )
}


function IssueItem({ issue }) {
  const decoded = useMemo(() => decodeEscapedText(issue.code_example || ""), [issue.code_example])
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <CircleDot size={13} className="text-slate-300" />
        </div>
        <p className="text-slate-700 text-[14.5px] leading-relaxed font-normal">{issue.description}</p>
      </div>
      {decoded && (
        <div className="ml-6">
          <CodeBlock code={decoded} language={issue.language} />
        </div>
      )}
    </div>
  )
}


function FileReview({ review }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="h-px flex-1 bg-slate-100" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 shadow-sm">
          <FileCode2 size={12} className="text-blue-400 flex-shrink-0" />
          <span className="rp-mono text-[11px] text-slate-300 font-medium">{review.file}</span>
        </div>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="space-y-6 pl-1">
        {review.issues?.map((issue, i) => (
          <IssueItem key={i} issue={issue} />
        ))}
      </div>
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
  const rc = getRisk(riskLabel)

  const totalIssues = useMemo(
    () => fileReviews.reduce((acc, f) => acc + (f.issues?.length || 0), 0),
    [fileReviews]
  )

  return (
    <div className="rp-root max-w-5xl mx-auto px-4 py-10 space-y-6 min-h-screen">
      <GlobalStyles />

      <div className="rp-fade-up flex items-start justify-between pb-2">
        <div>
          <div className="rp-mono inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">
            <Zap size={11} fill="currentColor" />
            AI Analysis Engine
          </div>
          <h1 className="text-[32px] font-semibold text-slate-900 tracking-tight leading-tight">
            PR Security Review
          </h1>
          <p className="text-slate-400 text-[14px] mt-1 font-normal">
            Automated risk assessment and code-level findings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Risk Score"   value={riskScore.toFixed(1)} icon={Shield}        risk={riskLabel} delay="rp-delay-1" />
        <StatCard label="Risk Label"   value={riskLabel}            icon={AlertTriangle}  risk={riskLabel} delay="rp-delay-2" />
        <StatCard label="Action Items" value={mitigationSteps.length} icon={CheckCircle2}                 delay="rp-delay-3" />
        <StatCard label="Key Findings" value={totalIssues}           icon={Code2}                         delay="rp-delay-4" />
      </div>

      {riskExplanation && (
        <ExecutiveSummary text={riskExplanation} riskLabel={riskLabel} />
      )}

      {mitigationSteps.length > 0 && (
        <Section
          icon={AlertTriangle}
          iconColor={rc.text}
          title="Mitigation Strategy"
          meta={`${mitigationSteps.length} action${mitigationSteps.length !== 1 ? "s" : ""}`}
          delay="rp-delay-2"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {mitigationSteps.map((step, i) => (
              <MitigationStep key={i} text={step} index={i} rc={rc} />
            ))}
          </div>
        </Section>
      )}

      {fileReviews.length > 0 && (
        <Section
          icon={Code2}
          iconColor="text-blue-500"
          title="File Level Analysis"
          meta={`${fileReviews.length} file${fileReviews.length !== 1 ? "s" : ""}`}
          delay="rp-delay-3"
        >
          <div className="space-y-10">
            {fileReviews.map((r, i) => (
              <FileReview key={i} review={r} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}