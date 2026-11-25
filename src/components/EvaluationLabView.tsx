import { useMemo, useState } from 'react';
import { Check, Play, X } from 'lucide-react';
import { HELDOUT_EVAL_QUESTIONS, MAIN_EVAL_QUESTIONS } from '../engine/evaluationData';
import { answerQuestion } from '../engine/libraryQA';
import { EngineMode, EvalQuestion, ParsedKnowledgeBase, RuleTopic } from '../types/qa';

interface EvaluationLabViewProps {
  kb: ParsedKnowledgeBase;
  ruleBase: RuleTopic[];
  threshold: number;
  onRunInChat: (question: string, mode: EngineMode) => void;
}

interface EvalRowResult {
  item: EvalQuestion;
  originalCorrect: boolean;
  finalCorrect: boolean;
  originalTopic: string | null;
  finalTopic: string | null;
  finalScore: number;
}

export function EvaluationLabView({
  kb,
  ruleBase,
  threshold,
  onRunInChat,
}: EvaluationLabViewProps) {
  const [activeSet, setActiveSet] = useState<'main' | 'heldout'>('main');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'missed'>('all');

  const evaluatedMain = useMemo(() => {
    return MAIN_EVAL_QUESTIONS.map((item) => {
      const orig = answerQuestion(item.question, kb, ruleBase, { mode: 'original' });
      const fin = answerQuestion(item.question, kb, ruleBase, { mode: 'final', threshold });
      return {
        item,
        originalCorrect: orig.trace.winningTopicKey === item.expectedTopicKey,
        finalCorrect: fin.trace.winningTopicKey === item.expectedTopicKey,
        originalTopic: orig.trace.winningTopicDisplay,
        finalTopic: fin.trace.winningTopicDisplay,
        finalScore: fin.trace.winningScore,
      } as EvalRowResult;
    });
  }, [kb, ruleBase, threshold]);

  const evaluatedHeldout = useMemo(() => {
    return HELDOUT_EVAL_QUESTIONS.map((item) => {
      const orig = answerQuestion(item.question, kb, ruleBase, { mode: 'original' });
      const fin = answerQuestion(item.question, kb, ruleBase, { mode: 'final', threshold });
      return {
        item,
        originalCorrect: orig.trace.winningTopicKey === item.expectedTopicKey,
        finalCorrect: fin.trace.winningTopicKey === item.expectedTopicKey,
        originalTopic: orig.trace.winningTopicDisplay,
        finalTopic: fin.trace.winningTopicDisplay,
        finalScore: fin.trace.winningScore,
      } as EvalRowResult;
    });
  }, [kb, ruleBase, threshold]);

  const mainOrigCorrect = evaluatedMain.filter((r) => r.originalCorrect).length;
  const mainFinalCorrect = evaluatedMain.filter((r) => r.finalCorrect).length;
  const heldOrigCorrect = evaluatedHeldout.filter((r) => r.originalCorrect).length;
  const heldFinalCorrect = evaluatedHeldout.filter((r) => r.finalCorrect).length;

  const baseRows = activeSet === 'main' ? evaluatedMain : evaluatedHeldout;
  const activeRows = baseRows.filter((row) => {
    if (statusFilter === 'passed') return row.finalCorrect;
    if (statusFilter === 'missed') return !row.finalCorrect;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF9F6] dark:bg-[#0B1110] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
            Live Evaluation Benchmarks
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
            Compare Original v1 (first-match substring) against the Final weighted engine across
            the 24-question and 10-question held-out benchmark sets.
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917]">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Main Set (Original v1)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
              {mainOrigCorrect} / {evaluatedMain.length}{' '}
              <span className="text-sm font-normal text-stone-500">
                ({Math.round((mainOrigCorrect / evaluatedMain.length) * 1000) / 10}%)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917]">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Main Set (Final Weighted)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {mainFinalCorrect} / {evaluatedMain.length}{' '}
              <span className="text-sm font-normal text-stone-500">
                ({Math.round((mainFinalCorrect / evaluatedMain.length) * 1000) / 10}%)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917]">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Held-Out Set (Original v1)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
              {heldOrigCorrect} / {evaluatedHeldout.length}{' '}
              <span className="text-sm font-normal text-stone-500">
                ({Math.round((heldOrigCorrect / evaluatedHeldout.length) * 100)}%)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917]">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Held-Out Set (Final Weighted)
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {heldFinalCorrect} / {evaluatedHeldout.length}{' '}
              <span className="text-sm font-normal text-stone-500">
                ({Math.round((heldFinalCorrect / evaluatedHeldout.length) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Benchmark Table */}
        <section className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-md dark:bg-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveSet('main')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    activeSet === 'main'
                      ? 'bg-white text-stone-900 shadow-xs dark:bg-[#0B1110] dark:text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
                  }`}
                >
                  24-Question Set
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSet('heldout')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    activeSet === 'heldout'
                      ? 'bg-white text-stone-900 shadow-xs dark:bg-[#0B1110] dark:text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
                  }`}
                >
                  10-Question Held-Out Set
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-md dark:bg-stone-800">
                {(['all', 'passed', 'missed'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition-colors cursor-pointer ${
                      statusFilter === f
                        ? 'bg-white text-stone-900 shadow-xs dark:bg-[#0B1110] dark:text-stone-100'
                        : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
              Showing {activeRows.length} of {baseRows.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
                  <th className="py-2.5 px-4 font-medium">Question</th>
                  <th className="py-2.5 px-4 font-medium">Expected</th>
                  <th className="py-2.5 px-4 font-medium">Original v1</th>
                  <th className="py-2.5 px-4 font-medium">Final</th>
                  <th className="py-2.5 px-4 font-medium text-right">Score</th>
                  <th className="py-2.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {activeRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-xs text-stone-500 dark:text-stone-400"
                    >
                      No benchmark questions match this filter.
                    </td>
                  </tr>
                ) : (
                  activeRows.map((row) => (
                    <tr
                      key={row.item.id}
                      className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-stone-900 dark:text-stone-100 font-medium">
                        {row.item.question}
                      </td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {row.item.categoryLabel}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            row.originalCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {row.originalCorrect ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          {row.originalTopic || 'Fallback'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            row.finalCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}
                        >
                          {row.finalCorrect ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          {row.finalTopic || 'Fallback'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-700 dark:text-stone-300">
                        {row.finalScore}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onRunInChat(row.item.question, 'final')}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-medium cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          Test
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
