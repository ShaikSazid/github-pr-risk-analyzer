import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent } from "../ui/Card";
import { Github, Sparkles, ArrowRight } from "lucide-react";

export function PRAnalyzer({ onAnalyze, loading, error, onReset }) {
  const [prUrl, setPrUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prUrl.trim()) {
      await onAnalyze(prUrl.trim());
    }
  };

  const handleReset = () => {
    setPrUrl("");
    onReset();
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Github className="h-5 w-5" />
              <span className="font-medium">Analyze Pull Request</span>
            </div>
            <p className="text-sm text-slate-500">
              Enter a GitHub PR URL to get instant AI-powered risk analysis
            </p>
          </div>

          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo/pull/123"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              disabled={loading}
              className="text-center"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={loading}
              disabled={!prUrl.trim() || loading}
              className="flex-1"
              size="lg"
            >
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing... (this may take a minute)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze PR
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {(prUrl || error) && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={loading}
                size="lg"
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
