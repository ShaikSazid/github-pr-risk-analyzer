const GlobalSkeletonStyles = () => (
  <style>{`
    @keyframes sk-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .sk-bone {
      background: linear-gradient(90deg, #f1f5f9 0px, #e2e8f0 150px, #f1f5f9 300px);
      background-size: 600px 100%;
      animation: sk-shimmer 1.5s ease-in-out infinite;
      border-radius: 6px;
    }
    .sk-bone-dark {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.08) 150px, rgba(255,255,255,0.04) 300px);
      background-size: 600px 100%;
      animation: sk-shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
    }
    @keyframes sk-fade-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sk-fade-up   { animation: sk-fade-up 0.35s ease both; }
    .sk-d1 { animation-delay: 60ms;  }
    .sk-d2 { animation-delay: 120ms; }
    .sk-d3 { animation-delay: 180ms; }
    .sk-d4 { animation-delay: 240ms; }

    /* wave stagger on shimmer */
    .sk-wave > *:nth-child(1) .sk-bone { animation-delay: 0ms;   }
    .sk-wave > *:nth-child(2) .sk-bone { animation-delay: 80ms;  }
    .sk-wave > *:nth-child(3) .sk-bone { animation-delay: 160ms; }
    .sk-wave > *:nth-child(4) .sk-bone { animation-delay: 240ms; }
  `}</style>
)

function Bone({ w = "w-full", h = "h-3", className = "" }) {
  return <div className={`sk-bone ${w} ${h} ${className}`} />
}

function DarkBone({ w = "w-full", h = "h-3" }) {
  return <div className={`sk-bone-dark ${w} ${h}`} />
}

function Card({ children, className = "", delay = "" }) {
  return (
    <div className={`sk-fade-up ${delay} bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <Bone w="w-3.5" h="h-3.5" className="rounded-sm" />
        <Bone w="w-36" h="h-2.5" />
      </div>
      <Bone w="w-14" h="h-5" className="rounded-full" />
    </div>
  )
}

export function SkeletonLoader() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <GlobalSkeletonStyles />

      {/* Header */}
      <div className="sk-fade-up space-y-3 pb-2">
        <Bone w="w-28" h="h-3" className="rounded-full" />
        <Bone w="w-56" h="h-8" />
        <Bone w="w-72" h="h-3.5" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sk-wave">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <Bone w="w-8" h="h-8" className="rounded-xl" />
              <Bone w="w-16" h="h-5" className="rounded-full" />
            </div>
            <Bone w="w-20" h="h-7" className="mb-2.5" />
            <Bone w="w-24" h="h-2.5" />
          </Card>
        ))}
      </div>

      {/* Executive summary */}
      <div className="sk-fade-up sk-d1 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Bone w="w-full" h="h-[3px]" className="rounded-none" />
        <div className="bg-white px-6 py-6 flex gap-5">
          <Bone w="w-8" h="h-8" className="flex-shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2.5 pt-1">
            <Bone w="w-28" h="h-2.5" />
            <Bone w="w-full" h="h-3.5" />
            <Bone w="w-5/6" h="h-3.5" />
            <Bone w="w-3/4" h="h-3.5" />
          </div>
        </div>
      </div>

      {/* Mitigation strategy */}
      <Card delay="sk-d2">
        <SectionHeader />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative flex gap-4 p-5 rounded-xl bg-slate-50/70 border border-slate-100 overflow-hidden">
              <Bone w="w-[2px]" h="h-full" className="absolute left-0 top-0 bottom-0 rounded-l-xl" />
              <Bone w="w-6" h="h-6" className="flex-shrink-0 rounded-md mt-0.5" />
              <div className="flex-1 space-y-2 pt-0.5">
                <Bone w="w-full" h="h-3" />
                <Bone w="w-4/5" h="h-3" />
                <Bone w="w-2/3" h="h-3" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* File level analysis */}
      <Card delay="sk-d3">
        <SectionHeader />
        <div className="p-6 space-y-10">
          {Array.from({ length: 2 }).map((_, fi) => (
            <div key={fi} className="space-y-5">

              {/* Filename divider */}
              <div className="flex items-center gap-2.5">
                <div className="h-px flex-1 bg-slate-100" />
                <Bone w="w-52" h="h-7" className="rounded-lg" />
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Issues */}
              <div className="space-y-6 pl-1">
                {Array.from({ length: 2 }).map((_, ii) => (
                  <div key={ii} className="space-y-3">
                    <div className="flex gap-3">
                      <Bone w="w-3" h="h-3" className="flex-shrink-0 rounded-full mt-1" />
                      <div className="flex-1 space-y-2">
                        <Bone w="w-full" h="h-3.5" />
                        <Bone w="w-5/6" h="h-3.5" />
                      </div>
                    </div>

                    {/* Code block */}
                    <div className="ml-6 rounded-xl border border-slate-200 overflow-hidden bg-[#0d1117]">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/25 border border-rose-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/25 border border-amber-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/40" />
                          </div>
                          <DarkBone w="w-12" h="h-2" />
                        </div>
                        <DarkBone w="w-12" h="h-5" />
                      </div>
                      <div className="p-5 space-y-2.5">
                        {[85, 60, 75, 45, 68].map((w, li) => (
                          <DarkBone key={li} w={`w-[${w}%]`} h="h-3" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <Bone w="w-40" h="h-2.5" />
        <Bone w="w-8" h="h-2.5" />
      </div>
    </div>
  )
}