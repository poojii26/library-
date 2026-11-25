import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  GitBranch,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Send,
} from 'lucide-react';
import { STARTER_PROMPTS } from '../engine/evaluationData';
import {
  ChatMessage,
  ChatSession,
  EngineMode,
  ParsedKnowledgeBase,
  ReasoningTrace,
} from '../types/qa';
import { ReasoningTracePanel } from './ReasoningTracePanel';

interface ChatWorkspaceProps {
  session: ChatSession;
  kb: ParsedKnowledgeBase;
  engineMode: EngineMode;
  threshold: number;
  onChangeEngineMode: (mode: EngineMode) => void;
  onAskQuestion: (question: string, overrideMode?: EngineMode) => ReasoningTrace | null;
  onOpenKnowledgeBase: () => void;
}

export function ChatWorkspace({
  session,
  kb,
  engineMode,
  threshold,
  onChangeEngineMode,
  onAskQuestion,
  onOpenKnowledgeBase,
}: ChatWorkspaceProps) {
  const [input, setInput] = useState('');
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Determine which trace to show in the Reasoning Inspector
  const assistantMessages = session.messages.filter(
    (m) => m.role === 'assistant' && m.trace
  );
  const latestTraceMessage = assistantMessages[assistantMessages.length - 1];
  const activeTraceMessage =
    assistantMessages.find((m) => m.id === selectedTraceId) ?? latestTraceMessage ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages.length, session.id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    onAskQuestion(trimmed);
    setSelectedTraceId(null);
  };

  const handlePromptClick = (question: string) => {
    onAskQuestion(question);
    setSelectedTraceId(null);
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 min-w-0 flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Compact Workspace Toolbar */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onChangeEngineMode('final')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                engineMode === 'final'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Weighted Rules (Final)
            </button>
            <button
              type="button"
              onClick={() => onChangeEngineMode('original')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                engineMode === 'original'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              First-Match (Original v1)
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={onOpenKnowledgeBase}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors tabular-nums cursor-pointer"
            >
              {kb.entries.length} KB facts · Threshold ≥ {threshold}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowInspector((prev) => !prev);
                setMobileDrawerOpen((prev) => !prev);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {showInspector ? (
                <>
                  <PanelRightClose className="w-4 h-4 hidden xl:block" />
                  <PanelRightOpen className="w-4 h-4 xl:hidden" />
                  <span className="hidden xl:inline">Hide trace</span>
                  <span className="xl:hidden">Inspect trace</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-4 h-4" />
                  <span>Show trace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {session.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8">
              <div className="space-y-3">
                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                  Ask the Library Knowledge Base
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Query library hours, borrowing limits, return deadlines, overdue fines, and
                  membership rules. Every answer is computed deterministically using weighted
                  IF–THEN rules and whole-token search—without black-box NLP or RAG.
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Try a sample question
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STARTER_PROMPTS.map((item) => (
                    <button
                      key={item.question}
                      type="button"
                      onClick={() => handlePromptClick(item.question)}
                      className="group text-left p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-600/50 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {item.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {item.question}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.hint}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {session.messages.map((msg: ChatMessage, idx: number) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-lg bg-slate-900 text-white px-4 py-3 text-sm leading-relaxed dark:bg-blue-700">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                const trace = msg.trace;
                const previousUserMsg =
                  idx > 0 && session.messages[idx - 1].role === 'user'
                    ? session.messages[idx - 1].content
                    : null;
                const isSelectedTrace = activeTraceMessage?.id === msg.id;

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div
                      className={`w-full rounded-lg border bg-white p-4 sm:p-5 space-y-3 dark:bg-slate-900 transition-colors ${
                        isSelectedTrace
                          ? 'border-blue-600/40 dark:border-blue-500/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Unboxed Metadata Line */}
                      {trace && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`font-semibold ${
                                trace.usedFallback
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {trace.usedFallback
                                ? 'Out of scope · Fallback'
                                : trace.winningTopicDisplay}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              Score {trace.winningScore} (threshold ≥ {trace.threshold})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {trace.mode === 'final' ? 'Weighted' : 'Original v1'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{trace.elapsedMs.toFixed(3)} ms</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {previousUserMsg && (
                              <button
                                type="button"
                                onClick={() =>
                                  onAskQuestion(
                                    previousUserMsg,
                                    trace.mode === 'final' ? 'original' : 'final'
                                  )
                                }
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Compare {trace.mode === 'final' ? 'Original v1' : 'Final'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTraceId(msg.id);
                                setShowInspector(true);
                                setMobileDrawerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                            >
                              <GitBranch className="w-3 h-3" />
                              Inspect trace
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Answer Text */}
                      <p className="text-sm sm:text-[15px] leading-relaxed text-slate-900 dark:text-slate-100">
                        {msg.content}
                      </p>

                      {/* Matched Keywords Inline Strip */}
                      {trace && !trace.usedFallback && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>Matched tokens:</span>
                          {trace.topicScores
                            .find((t) => t.topicKey === trace.winningTopicKey)
                            ?.matchedKeywords.map((kw, i) => (
                              <span
                                key={`${kw.word}-${i}`}
                                className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {kw.word} (+{kw.weight})
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Docked Bottom Composer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 sm:px-8 py-4 dark:bg-slate-900 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about library timings, borrowing limit, return period, fines, or membership..."
                aria-label="Ask a library question"
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none rounded-md transition-colors shrink-0 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Ask</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Quick test:</span>
              {[
                'What is the fine per day?',
                'How many books can I borrow?',
                'Where is the canteen?',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handlePromptClick(q)}
                  className="hover:text-blue-700 dark:hover:text-blue-400 underline underline-offset-2 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Right Reasoning Trace Inspector (Desktop) */}
      {showInspector && (
        <aside className="hidden xl:block w-88 shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <ReasoningTracePanel
            trace={activeTraceMessage?.trace ?? null}
            onClose={() => setShowInspector(false)}
          />
        </aside>
      )}

      {/* Slide-over Reasoning Trace Drawer (<xl viewports) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 xl:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/40"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-88 max-w-[90vw] h-full border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <ReasoningTracePanel
              trace={activeTraceMessage?.trace ?? null}
              onClose={() => setMobileDrawerOpen(false)}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
