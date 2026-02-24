import { useState } from "react";
import { Input } from "../ui/Input";
import {
  Github,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  XCircle,
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

  const serverError = !localError && error;

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
            {localError && (
              <div className="flex items-center gap-2 px-1 animate-fade-in">
                <div className="w-1 h-1 rounded-full bg-rose-400 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-rose-500 tracking-wide">
                  Invalid PR URL. Use format:{" "}
                  <span className="ml-1 font-mono text-[12px] text-rose-600 font-bold">
                    https://github.com/owner/repo/pull/123
                  </span>
                </p>
              </div>
            )}

            {aiUnavailable && !localError && !error && (
              <div className="flex items-center gap-2 px-1 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-[12px] font-medium text-amber-600 tracking-wide">
                  AI review is temporarily unavailable.
                </p>
              </div>
            )}
          </div>
          {serverError && (
            <div className="relative animate-slide-up">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-[1.5rem] blur opacity-10" />
              <div className="relative bg-white/70 backdrop-blur-xl border border-rose-100 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-rose-50 bg-white/40">
                  <div className="flex items-center justify-center p-1.5 bg-white rounded-lg shadow-sm border border-rose-200 flex-shrink-0">
                    <XCircle size={15} className="text-rose-500" />
                  </div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                    Analysis Failed
                  </h3>
                </div>
                <div className="flex items-start gap-4 px-5 py-5">
                  <div className="flex-shrink-0 w-9 h-9 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={16} className="text-rose-500" />
                  </div>
                  <div className="space-y-1 pt-0.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                      What went wrong
                    </p>
                    <p className="text-slate-700 text-[14px] font-semibold leading-relaxed">
                      {typeof error === "string" ? error : error?.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
