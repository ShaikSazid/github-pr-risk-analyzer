import { useState } from "react";
import { Input } from "../ui/Input";
import {
  Github,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { validateGitHubURL } from "../../utils/validators";

export function PRAnalyzer({
  onAnalyze,
  loading,
  error,
  onReset,
  aiUnavailable,
}) {
  const [prUrl, setPrUrl] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateGitHubURL(prUrl);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    await onAnalyze(prUrl.trim());
  };

  const handleReset = () => {
    setPrUrl("");
    setLocalError(null);
    onReset();
  };

  // localError takes priority; server error falls back to same inline display
  const displayError = localError
    || (error ? (typeof error === "string" ? error : error?.message) : null);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden animate-slide-up shadow-sm">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-white/40">
        <div className="flex items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-200/60 flex-shrink-0">
          <Github size={18} className="text-slate-600" />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Analyze Pull Request
        </h3>
      </div>

      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
            Enter a GitHub PR URL to get an instant AI-powered risk assessment
            and code review.
          </p>

          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => {
                setPrUrl(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={loading}
            />

            {/* Single inline error — handles both local validation and server errors */}
            {displayError && (
              <div className="flex items-center gap-2 px-1 animate-fade-in">
                <div className="w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-rose-500 tracking-wide">
                  {displayError}
                </p>
              </div>
            )}

            {aiUnavailable && !displayError && (
              <div className="flex items-center gap-2 px-1 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-[12px] font-medium text-amber-600 tracking-wide">
                  AI review is temporarily unavailable.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={!prUrl.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Sparkles size={14} className="animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyze PR
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {(prUrl || error || localError) && !loading && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}