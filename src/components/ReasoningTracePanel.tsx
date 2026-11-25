import { CheckCircle2, HelpCircle, X } from 'lucide-react';
import { ReasoningTrace } from '../types/qa';

interface ReasoningTracePanelProps {
  trace: ReasoningTrace | null;
  onClose?: () => void;
}

export function ReasoningTracePanel({ trace, onClose }: ReasoningTracePanelProps) {
  if (!trace) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-6 text-center text-slate-500 dark:text-slate-400">
        <HelpCircle className="w-6 h-6 mb-2 text-slate-400" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Reasoning Inspector
        </p>
        <p className="mt-1 text-xs leading-relaxed max-w-[240px]">
          Ask any question in the chat or click &ldquo;Inspect trace&rdquo; on an answer to see
          tokenization, suffix stripping, and weighted rule scores.
        </p>
      </div>
    );
  }

  const maxScore = Math.max(
    trace.threshold,
    ...trace.topicScores.map((t) => t.score),
    1
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Reasoning Trace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {trace.mode === 'final' ? 'Weighted scoring' : 'Original v1 first-match'} ·{' '}
            {trace.elapsedMs.toFixed(3)} ms
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trace panel"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-6 text-xs">
        {/* Stage 1 & 2: Token Pipeline */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            1. Question Processing Pipeline
          </h3>

          <div className="space-y-2.5">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Alphanumeric tokens ({trace.pipeline.rawTokens.length})
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {trace.pipeline.rawTokens.map((tok, i) => {
                  const isStop = trace.pipeline.stopWordsRemoved.includes(tok);
                  return (
                    <span
                      key={`${tok}-${i}`}
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        isStop
                          ? 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800/70 dark:text-slate-500'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                After stop-word removal & suffix stripping
              </div>
              {trace.pipeline.stemmedTokens.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {trace.pipeline.stemmedTokens.map((tok, i) => (
                    <span
                      key={`${tok}-${i}`}
                      className="px-1.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-800 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic">No content tokens remained.</span>
              )}
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Stage 3: Weighted Topic Scoring */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              2. Topic Rule Scores
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Threshold ≥ {trace.threshold}
            </span>
          </div>

          <div className="space-y-3">
            {trace.topicScores.map((topic) => {
              const isWinner =
                !trace.usedFallback && trace.winningTopicKey === topic.topicKey;
              const pct = Math.min(100, Math.round((topic.score / maxScore) * 100));

              return (
                <div key={topic.topicKey} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-medium truncate ${
                        isWinner
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {topic.displayName}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
                      {topic.score}
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isWinner
                          ? 'bg-blue-700 dark:bg-blue-500'
                          : topic.score > 0
                          ? 'bg-slate-400 dark:bg-slate-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {topic.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {topic.matchedKeywords.map((mk, idx) => (
                        <span key={`${mk.word}-${idx}`}>
                          {mk.word}(+{mk.weight})
                          {idx < topic.matchedKeywords.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Stage 4: Decision */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            3. Decision & Retrieval
          </h3>
          <div className="p-3 rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  trace.usedFallback ? 'text-amber-600' : 'text-emerald-600'
                }`}
              />
              <span>
                {trace.usedFallback
                  ? 'Fallback triggered'
                  : `Matched: ${trace.winningTopicDisplay}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {trace.notes}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
