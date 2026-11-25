import { FormEvent, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { answerQuestion, DEFAULT_RULE_BASE } from '../engine/libraryQA';
import { ParsedKnowledgeBase, RuleTopic } from '../types/qa';

interface RuleEngineViewProps {
  ruleBase: RuleTopic[];
  threshold: number;
  kb: ParsedKnowledgeBase;
  onUpdateRuleBase: (rules: RuleTopic[]) => void;
  onUpdateThreshold: (value: number) => void;
  onResetDefaults: () => void;
}

export function RuleEngineView({
  ruleBase,
  threshold,
  kb,
  onUpdateRuleBase,
  onUpdateThreshold,
  onResetDefaults,
}: RuleEngineViewProps) {
  const [liveTestQuestion, setLiveTestQuestion] = useState(
    'How much penalty is charged for late returns?'
  );
  const [newWordByTopic, setNewWordByTopic] = useState<Record<string, string>>({});
  const [newWeightByTopic, setNewWeightByTopic] = useState<Record<string, number>>({});
  const [newTopicName, setNewTopicName] = useState('');

  const liveResult = answerQuestion(liveTestQuestion, kb, ruleBase, {
    mode: 'final',
    threshold,
  });

  const handleWeightChange = (topicKey: string, word: string, delta: number) => {
    onUpdateRuleBase(
      ruleBase.map((topic) => {
        if (topic.topicKey !== topicKey) return topic;
        return {
          ...topic,
          keywords: topic.keywords.map((kw) =>
            kw.word === word
              ? { ...kw, weight: Math.max(1, Math.min(6, kw.weight + delta)) }
              : kw
          ),
        };
      })
    );
  };

  const handleRemoveKeyword = (topicKey: string, word: string) => {
    onUpdateRuleBase(
      ruleBase.map((topic) =>
        topic.topicKey === topicKey
          ? { ...topic, keywords: topic.keywords.filter((kw) => kw.word !== word) }
          : topic
      )
    );
  };

  const handleAddKeyword = (e: FormEvent, topicKey: string) => {
    e.preventDefault();
    const rawWord = (newWordByTopic[topicKey] || '').trim().toLowerCase();
    if (!rawWord) return;
    const weight = newWeightByTopic[topicKey] || 3;

    onUpdateRuleBase(
      ruleBase.map((topic) => {
        if (topic.topicKey !== topicKey) return topic;
        const exists = topic.keywords.some((kw) => kw.word === rawWord);
        if (exists) return topic;
        return {
          ...topic,
          keywords: [...topic.keywords, { word: rawWord, weight }],
        };
      })
    );
    setNewWordByTopic((prev) => ({ ...prev, [topicKey]: '' }));
  };

  const handleAddTopicRule = (e: FormEvent) => {
    e.preventDefault();
    const clean = newTopicName.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (ruleBase.some((t) => t.topicKey === key)) return;
    onUpdateRuleBase([
      ...ruleBase,
      {
        topicKey: key,
        displayName: clean,
        keywords: [{ word: key.split(' ')[0], weight: 3 }],
      },
    ]);
    setNewTopicName('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF9F6] dark:bg-[#0B1110] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">
              Weighted Rule Matrix
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
              Adjust keyword weights, add new synonyms, or tune the relevance threshold and watch
              live scoring update immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateRuleBase(DEFAULT_RULE_BASE);
              onUpdateThreshold(2);
              onResetDefaults();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-md dark:bg-[#111917] dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-800 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset rule weights
          </button>
        </div>

        {/* Live Scoring Preview + Threshold */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <div className="lg:col-span-2 rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Live Scoring Preview
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                {liveResult.trace.usedFallback
                  ? `Fallback · Score ${liveResult.trace.winningScore}`
                  : `${liveResult.trace.winningTopicDisplay} · Score ${liveResult.trace.winningScore}`}
              </span>
            </div>
            <input
              type="text"
              value={liveTestQuestion}
              onChange={(e) => setLiveTestQuestion(e.target.value)}
              placeholder="Type a question to test live weights..."
              aria-label="Live rule testing question"
              className="w-full px-3.5 py-2 text-sm bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
            />
            <div className="flex flex-wrap gap-3 text-xs text-stone-600 dark:text-stone-400 tabular-nums">
              {liveResult.trace.topicScores.map((ts) => (
                <span
                  key={ts.topicKey}
                  className={
                    ts.topicKey === liveResult.trace.winningTopicKey
                      ? 'font-semibold text-emerald-800 dark:text-emerald-400'
                      : ''
                  }
                >
                  {ts.displayName}: {ts.score}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Relevance Threshold:{' '}
                <span className="font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
                  {threshold}
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Minimum score required to return a Knowledge Base answer instead of the fallback.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-500">1</span>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={threshold}
                onChange={(e) => onUpdateThreshold(Number(e.target.value))}
                aria-label="Relevance threshold"
                className="flex-1 accent-emerald-700 cursor-pointer"
              />
              <span className="text-xs font-mono text-stone-500">6</span>
            </div>
          </div>
        </div>

        {/* Interactive Weighted Rule Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Topic Rules & Keywords
            </h2>

            <form onSubmit={handleAddTopicRule} className="flex items-center gap-2">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="New topic key (e.g. Study rooms)"
                className="px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-md text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:bg-[#111917] dark:border-stone-800 dark:text-stone-100"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Plus className="w-3.5 h-3.5" />
                Add topic
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {ruleBase.map((topic) => {
              const linkedToKB = Boolean(kb.map[topic.topicKey.toLowerCase()]);
              return (
                <div
                  key={topic.topicKey}
                  className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-[#111917] p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {topic.displayName}
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        KB key: <code className="font-mono">{topic.topicKey}</code> ·{' '}
                        {linkedToKB ? 'Matched in library.txt' : 'Missing in library.txt'}
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => handleAddKeyword(e, topic.topicKey)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={newWordByTopic[topic.topicKey] || ''}
                        onChange={(e) =>
                          setNewWordByTopic((prev) => ({
                            ...prev,
                            [topic.topicKey]: e.target.value,
                          }))
                        }
                        placeholder="Add keyword..."
                        className="w-32 px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 focus:outline-none dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
                      />
                      <select
                        value={newWeightByTopic[topic.topicKey] || 3}
                        onChange={(e) =>
                          setNewWeightByTopic((prev) => ({
                            ...prev,
                            [topic.topicKey]: Number(e.target.value),
                          }))
                        }
                        aria-label={`Weight for new keyword in ${topic.displayName}`}
                        className="px-2 py-1.5 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
                      >
                        {[1, 2, 3, 4, 5].map((w) => (
                          <option key={w} value={w}>
                            w={w}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {topic.keywords.map((kw) => (
                      <div
                        key={kw.word}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-[#FAF9F6] text-xs dark:border-stone-800 dark:bg-[#0B1110]"
                      >
                        <span className="font-mono text-stone-800 dark:text-stone-200">
                          {kw.word}
                        </span>
                        <span className="text-stone-400">·</span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(topic.topicKey, kw.word, -1)}
                          aria-label={`Decrease weight for ${kw.word}`}
                          className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-semibold tabular-nums text-emerald-800 dark:text-emerald-400">
                          {kw.weight}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(topic.topicKey, kw.word, 1)}
                          aria-label={`Increase weight for ${kw.word}`}
                          className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(topic.topicKey, kw.word)}
                          aria-label={`Remove keyword ${kw.word}`}
                          className="ml-0.5 text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
