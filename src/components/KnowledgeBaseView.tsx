import { FormEvent, useState } from 'react';
import { AlertTriangle, CheckCircle2, Play, Plus, RotateCcw } from 'lucide-react';
import { answerQuestion, DEFAULT_LIBRARY_TEXT } from '../engine/libraryQA';
import { ParsedKnowledgeBase, RuleTopic } from '../types/qa';

interface KnowledgeBaseViewProps {
  libraryText: string;
  kb: ParsedKnowledgeBase;
  ruleBase: RuleTopic[];
  threshold: number;
  onUpdateLibraryText: (text: string) => void;
  onTestInChat: (question: string) => void;
}

const EXPANDED_PRESET = `${DEFAULT_LIBRARY_TEXT}
Digital repository: Remote access to journals and e-books is available using your institutional credentials.
Study rooms: Group study rooms on the second floor can be reserved for up to 2 hours per day.`;

export function KnowledgeBaseView({
  libraryText,
  kb,
  ruleBase,
  threshold,
  onUpdateLibraryText,
  onTestInChat,
}: KnowledgeBaseViewProps) {
  const [quickQuestion, setQuickQuestion] = useState('What time does the library open?');
  const [newTopic, setNewTopic] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const quickResult = answerQuestion(quickQuestion, kb, ruleBase, {
    mode: 'final',
    threshold,
  });

  const ruleTopicSet = new Set(ruleBase.map((r) => r.topicKey.toLowerCase()));
  const unlinkedEntries = kb.entries.filter(
    (entry) => !ruleTopicSet.has(entry.topicKey)
  );

  const handleAddFact = (e: FormEvent) => {
    e.preventDefault();
    const cleanTopic = newTopic.trim();
    const cleanAnswer = newAnswer.trim();
    if (!cleanTopic || !cleanAnswer) return;
    const prefix = libraryText.trimEnd();
    onUpdateLibraryText(`${prefix}\n${cleanTopic}: ${cleanAnswer}`);
    setNewTopic('');
    setNewAnswer('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF9F6] dark:bg-[#0B1110] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Document & Knowledge Base
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
              Edit <code className="font-mono text-xs">library.txt</code> directly or add a new
              entry below. Each line splits at the first colon so times such as 9:00 AM stay
              intact.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateLibraryText(EXPANDED_PRESET)}
              className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md dark:bg-[#111917] dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
            >
              Load extended sample
            </button>
            <button
              type="button"
              onClick={() => onUpdateLibraryText(DEFAULT_LIBRARY_TEXT)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md dark:bg-[#111917] dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset default
            </button>
          </div>
        </div>

        {/* Quick Add Fact Form */}
        <form
          onSubmit={handleAddFact}
          className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3"
        >
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Topic (e.g. WiFi access)"
            aria-label="New Knowledge Base topic"
            className="md:w-56 px-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
          />
          <input
            type="text"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Answer rule stored in the Knowledge Base..."
            aria-label="New Knowledge Base answer"
            className="flex-1 px-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={!newTopic.trim() || !newAnswer.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 rounded-md cursor-pointer shrink-0 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fact
          </button>
        </form>

        {/* Two-Column Editor & Parsed Dictionary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                library.txt Source
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                {libraryText.split(/\r?\n/).length} lines
              </span>
            </div>

            <textarea
              value={libraryText}
              onChange={(e) => onUpdateLibraryText(e.target.value)}
              rows={11}
              spellCheck={false}
              aria-label="library.txt plain text knowledge base editor"
              className="flex-1 w-full p-5 font-mono text-xs sm:text-[13px] leading-relaxed bg-white text-stone-800 focus:outline-none resize-none dark:bg-[#111917] dark:text-stone-200"
            />

            {kb.skippedLines.length > 0 && (
              <div className="px-5 py-3 border-t border-stone-200 bg-[#FAF9F6] dark:border-stone-800 dark:bg-[#0B1110] text-xs text-stone-600 dark:text-stone-400">
                Skipped {kb.skippedLines.length} non-fact line
                {kb.skippedLines.length === 1 ? '' : 's'} without a colon:{' '}
                <span className="font-mono">
                  {kb.skippedLines.map((s) => `Line ${s.lineNumber}`).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Parsed Key–Value Entries
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                {kb.entries.length} entries
              </span>
            </div>

            <div className="flex-1 divide-y divide-stone-200 dark:divide-stone-800 overflow-y-auto">
              {kb.entries.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 dark:text-stone-400">
                  No valid &ldquo;Topic: answer&rdquo; entries found. Add a line containing a colon.
                </div>
              ) : (
                kb.entries.map((entry) => {
                  const hasRule = ruleTopicSet.has(entry.topicKey);
                  return (
                    <div key={`${entry.lineNumber}-${entry.topicKey}`} className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                          {entry.topicKey}
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 inline-flex items-center gap-1">
                          {hasRule ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Linked to rule
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              No rule keywords yet
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        {entry.answer}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {unlinkedEntries.length > 0 && (
              <div className="px-5 py-3 border-t border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300">
                Unlinked headings: {unlinkedEntries.length} KB heading
                {unlinkedEntries.length === 1 ? '' : 's'} have no matching rule topic in Rule
                Weights. Add matching keywords to make them searchable.
              </div>
            )}
          </div>
        </div>

        {/* Live KB Query Sandbox */}
        <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Instant Knowledge Base Lookup Test
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Verify how edits to <code className="font-mono">library.txt</code> immediately
                update retrieval answers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTestInChat(quickQuestion)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              Open in Chat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              placeholder="Type a question to test..."
              className="w-full px-3.5 py-2 text-sm bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
            />
            <div className="p-3.5 rounded-md border border-stone-200 bg-[#FAF9F6] dark:border-stone-800 dark:bg-[#0B1110] space-y-1">
              <div className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                {quickResult.trace.usedFallback
                  ? `Fallback · Score ${quickResult.trace.winningScore}`
                  : `${quickResult.trace.winningTopicDisplay} · Score ${quickResult.trace.winningScore}`}
              </div>
              <p className="text-sm text-stone-900 dark:text-stone-100">{quickResult.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
