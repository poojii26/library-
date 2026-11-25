import { CheckCircle2, HelpCircle, X } from 'lucide-react';
import { ReasoningTrace } from '../types/qa';

interface ReasoningTracePanelProps {
  trace: ReasoningTrace | null;
  onClose?: () => void;
}

export function ReasoningTracePanel({ trace, onClose }: ReasoningTracePanelProps) {
  if (!trace) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-6 text-center text-stone-500 dark:text-stone-400">
        <HelpCircle className="w-6 h-6 mb-2 text-stone-400" />
        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
          Reasoning Inspector
        </p>
        <p className="mt-1 text-xs leading-relaxed max-w-[240px]">
          Ask any library question or click &ldquo;Inspect trace&rdquo; on an answer to see
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
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Reasoning Trace
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
            {trace.mode === 'final' ? 'Weighted scoring' : 'Original v1 first-match'} ·{' '}
            {trace.elapsedMs.toFixed(3)} ms
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trace panel"
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-6 text-xs">
        {/* Tokenization & Normalization */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            1. Token Normalization
          </h3>

          <div className="space-y-2.5">
            <div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mb-1">
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
                          ? 'bg-stone-100 text-stone-400 line-through dark:bg-stone-800/70 dark:text-stone-500'
                          : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {tok}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                Remaining stems after suffix stripping
              </div>
              {trace.pipeline.stemmedTokens.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 font-mono">
                  {trace.pipeline.stemmedTokens.map((tok, i) => (
                    <span
                      key={`${tok}-${i}`}
                      className="px-1.5 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-stone-400 italic">No content tokens remained.</span>
              )}
            </div>
          </div>
        </section>

        <div className="border-t border-stone-200 dark:border-stone-800" />

        {/* Weighted Rule Scores */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              2. Topic Rule Scores
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
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
                          ? 'text-emerald-800 dark:text-emerald-400'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {topic.displayName}
                    </span>
                    <span className="font-mono tabular-nums text-stone-600 dark:text-stone-300 shrink-0">
                      {topic.score}
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-sm bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isWinner
                          ? 'bg-emerald-700 dark:bg-emerald-500'
                          : topic.score > 0
                          ? 'bg-stone-400 dark:bg-stone-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {topic.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-stone-500 dark:text-stone-400">
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

        <div className="border-t border-stone-200 dark:border-stone-800" />

        {/* Final Decision */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
            3. Decision & Retrieval
          </h3>
          <div className="p-3 rounded-md border border-stone-200 bg-[#FAF9F6] dark:border-stone-800 dark:bg-[#0B1110] space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-stone-100">
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  trace.usedFallback ? 'text-amber-600' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              />
              <span>
                {trace.usedFallback
                  ? 'Fallback triggered'
                  : `Matched: ${trace.winningTopicDisplay}`}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
              {trace.notes}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
