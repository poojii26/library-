import {
  EngineMode,
  KnowledgeEntry,
  ParsedKnowledgeBase,
  ReasoningTrace,
  RuleTopic,
  TokenPipelineTrace,
  TopicScoreBreakdown,
} from '../types/qa';

export const FALLBACK_ANSWER = 'Sorry, the answer is not available in the document.';

export const DEFAULT_LIBRARY_TEXT = `College Library Rules and Information
Library timings: The library is open from 9:00 AM to 8:00 PM, Monday to Saturday.
Maximum books: A student can borrow up to 4 books at a time.
Book return period: Borrowed books must be returned within 14 days.
Late return fine: A fine of Rs. 5 per day is charged for late book returns.
Library membership: All enrolled students and faculty members are eligible for library membership and can register with a valid ID card.`;

export const DEFAULT_RULE_BASE: RuleTopic[] = [
  {
    topicKey: 'library timings',
    displayName: 'Library timings',
    keywords: [
      { word: 'timing', weight: 3 },
      { word: 'open', weight: 3 },
      { word: 'close', weight: 3 },
      { word: 'time', weight: 2 },
      { word: 'hour', weight: 2 },
      { word: 'schedule', weight: 2 },
      { word: 'clock', weight: 1 },
      { word: 'am', weight: 1 },
      { word: 'pm', weight: 1 },
    ],
  },
  {
    topicKey: 'maximum books',
    displayName: 'Maximum books',
    keywords: [
      { word: 'limit', weight: 3 },
      { word: 'maximum', weight: 2 },
      { word: 'borrow', weight: 2 },
      { word: 'issue', weight: 2 },
      { word: 'number', weight: 2 },
      { word: 'book', weight: 1 },
      { word: 'many', weight: 1 },
      { word: 'copy', weight: 1 },
    ],
  },
  {
    topicKey: 'book return period',
    displayName: 'Book return period',
    keywords: [
      { word: 'period', weight: 3 },
      { word: 'days', weight: 3 },
      { word: 'keep', weight: 3 },
      { word: 'due', weight: 3 },
      { word: 'duration', weight: 3 },
      { word: 'deadline', weight: 3 },
      { word: 'return', weight: 2 },
      { word: 'long', weight: 2 },
      { word: 'day', weight: 1 },
    ],
  },
  {
    topicKey: 'late return fine',
    displayName: 'Late return fine',
    keywords: [
      { word: 'fine', weight: 4 },
      { word: 'penalty', weight: 4 },
      { word: 'overdue', weight: 4 },
      { word: 'late', weight: 3 },
      { word: 'charge', weight: 3 },
      { word: 'cost', weight: 2 },
      { word: 'pay', weight: 2 },
      { word: 'rs', weight: 1 },
    ],
  },
  {
    topicKey: 'library membership',
    displayName: 'Library membership',
    keywords: [
      { word: 'membership', weight: 4 },
      { word: 'eligible', weight: 4 },
      { word: 'eligibility', weight: 4 },
      { word: 'access', weight: 3 },
      { word: 'join', weight: 3 },
      { word: 'member', weight: 3 },
      { word: 'register', weight: 3 },
      { word: 'allowed', weight: 3 },
      { word: 'use', weight: 2 },
      { word: 'enter', weight: 2 },
      { word: 'who', weight: 1 },
    ],
  },
];

// Original v1 rule keywords (before F1-F4 fixes: missing synonyms like use/access/join/due/keep/overdue)
const ORIGINAL_V1_ORDER_AND_KEYWORDS: { topicKey: string; displayName: string; keywords: string[] }[] = [
  {
    topicKey: 'maximum books',
    displayName: 'Maximum books',
    keywords: ['books', 'book', 'maximum', 'limit', 'borrow', 'many'],
  },
  {
    topicKey: 'book return period',
    displayName: 'Book return period',
    keywords: ['return', 'period', 'days', 'long'],
  },
  {
    topicKey: 'library timings',
    displayName: 'Library timings',
    keywords: ['timing', 'timings', 'open', 'close', 'time', 'hours', 'hour'],
  },
  {
    topicKey: 'late return fine',
    displayName: 'Late return fine',
    keywords: ['fine', 'late', 'penalty', 'charge'],
  },
  {
    topicKey: 'library membership',
    displayName: 'Library membership',
    keywords: ['membership', 'member', 'eligible', 'register'],
  },
];

export const STOP_WORDS = new Set([
  'what',
  'how',
  'can',
  'the',
  'is',
  'are',
  'was',
  'were',
  'do',
  'does',
  'did',
  'i',
  'you',
  'we',
  'they',
  'he',
  'she',
  'it',
  'a',
  'an',
  'for',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'when',
  'where',
  'why',
  'which',
  'much',
  'my',
  'me',
  'your',
  'our',
  'their',
  'be',
  'must',
  'should',
  'will',
  'would',
  'could',
  'may',
  'might',
  'there',
  'this',
  'that',
  'these',
  'those',
  'if',
  'and',
  'or',
  'per',
  'get',
  'have',
  'has',
  'had',
  'about',
  'tell',
  'please',
  'library',
]);

export function parseKnowledgeBase(rawText: string): ParsedKnowledgeBase {
  const lines = rawText.split(/\r?\n/);
  const entries: KnowledgeEntry[] = [];
  const map: Record<string, KnowledgeEntry> = {};
  const skippedLines: { lineNumber: number; text: string; reason: string }[] = [];

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return;
    }

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      skippedLines.push({
        lineNumber,
        text: trimmed,
        reason: 'No colon separator (treated as heading or comment)',
      });
      return;
    }

    const displayTopic = trimmed.slice(0, colonIndex).trim();
    const answer = trimmed.slice(colonIndex + 1).trim();

    if (!displayTopic || !answer) {
      skippedLines.push({
        lineNumber,
        text: trimmed,
        reason: 'Missing topic or answer value around colon',
      });
      return;
    }

    const topicKey = displayTopic.toLowerCase();
    const entry: KnowledgeEntry = {
      topicKey,
      displayTopic,
      answer,
      lineNumber,
    };

    entries.push(entry);
    map[topicKey] = entry;
  });

  return { entries, map, skippedLines };
}

export function stripSuffix(token: string): string {
  // Keep short tokens like "days", "rs", "am", "pm", "use" intact
  if (token.length <= 4) {
    return token;
  }
  if (token.endsWith('ing') && token.length > 5) {
    return token.slice(0, -3);
  }
  if (token.endsWith('ed') && token.length > 5) {
    return token.slice(0, -2);
  }
  if (token.endsWith('ies') && token.length > 5) {
    return token.slice(0, -3) + 'y';
  }
  if (token.endsWith('es') && token.length > 5 && !token.endsWith('ses')) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
}

export function runTokenPipeline(question: string): TokenPipelineTrace {
  const lowercased = question.toLowerCase();
  const rawTokens = lowercased.match(/[a-z0-9]+/g) ?? [];
  const stopWordsRemoved: string[] = [];
  const afterStopWords: string[] = [];

  for (const token of rawTokens) {
    if (STOP_WORDS.has(token)) {
      stopWordsRemoved.push(token);
    } else {
      afterStopWords.push(token);
    }
  }

  const stemmedTokens = afterStopWords.map(stripSuffix);

  return {
    rawQuestion: question,
    lowercased,
    rawTokens,
    stopWordsRemoved,
    afterStopWords,
    stemmedTokens,
  };
}

export function answerQuestion(
  question: string,
  kb: ParsedKnowledgeBase,
  ruleBase: RuleTopic[],
  options: { mode?: EngineMode; threshold?: number } = {}
): { answer: string; trace: ReasoningTrace } {
  const mode = options.mode ?? 'final';
  const threshold = options.threshold ?? 2;
  const start = performance.now();

  const pipeline = runTokenPipeline(question);

  if (mode === 'original') {
    // Original v1 behavior:
    // 1. Substring matching against lowercased question
    // 2. Fixed rule order, first-match-wins
    // 3. Unweighted (every keyword hit = 1), no threshold
    const topicScores: TopicScoreBreakdown[] = [];
    let firstMatchTopic: { key: string; display: string } | null = null;

    for (const rule of ORIGINAL_V1_ORDER_AND_KEYWORDS) {
      const matched: { word: string; weight: number }[] = [];
      for (const kw of rule.keywords) {
        if (pipeline.lowercased.includes(kw)) {
          matched.push({ word: kw, weight: 1 });
        }
      }
      const inKnowledgeBase = Boolean(kb.map[rule.topicKey]);
      topicScores.push({
        topicKey: rule.topicKey,
        displayName: rule.displayName,
        score: matched.length,
        matchedKeywords: matched,
        inKnowledgeBase,
      });

      if (!firstMatchTopic && matched.length > 0 && inKnowledgeBase) {
        firstMatchTopic = { key: rule.topicKey, display: rule.displayName };
      }
    }

    const elapsedMs = Math.max(0.001, Number((performance.now() - start).toFixed(4)));
    if (firstMatchTopic && kb.map[firstMatchTopic.key]) {
      const winningScore =
        topicScores.find((t) => t.topicKey === firstMatchTopic!.key)?.score ?? 1;
      return {
        answer: kb.map[firstMatchTopic.key].answer,
        trace: {
          mode: 'original',
          threshold: 1,
          pipeline,
          topicScores,
          winningTopicKey: firstMatchTopic.key,
          winningTopicDisplay: firstMatchTopic.display,
          winningScore,
          usedFallback: false,
          elapsedMs,
          notes:
            'Original v1 mode: checked topics in fixed order using substring matching and returned the first keyword hit without weighting or a relevance threshold.',
        },
      };
    }

    return {
      answer: FALLBACK_ANSWER,
      trace: {
        mode: 'original',
        threshold: 1,
        pipeline,
        topicScores,
        winningTopicKey: null,
        winningTopicDisplay: null,
        winningScore: 0,
        usedFallback: true,
        elapsedMs,
        notes: 'Original v1 mode: no substring keyword hit found in any rule.',
      },
    };
  }

  // Final Weighted Engine:
  // Whole-token matching on stemmed tokens (deduplicated per question token set so repeated words don't inflate artificially)
  const tokenSet = new Set(pipeline.stemmedTokens);
  const topicScores: TopicScoreBreakdown[] = [];

  let bestTopic: TopicScoreBreakdown | null = null;

  for (const rule of ruleBase) {
    const matchedKeywords: { word: string; weight: number }[] = [];
    let score = 0;

    for (const kw of rule.keywords) {
      const normalizedKw = kw.word.toLowerCase().trim();
      if (!normalizedKw) continue;
      if (tokenSet.has(normalizedKw)) {
        matchedKeywords.push({ word: normalizedKw, weight: kw.weight });
        score += kw.weight;
      }
    }

    const inKnowledgeBase = Boolean(kb.map[rule.topicKey.toLowerCase()]);
    const breakdown: TopicScoreBreakdown = {
      topicKey: rule.topicKey.toLowerCase(),
      displayName: rule.displayName,
      score,
      matchedKeywords,
      inKnowledgeBase,
    };

    topicScores.push(breakdown);

    if (score > (bestTopic?.score ?? 0)) {
      bestTopic = breakdown;
    }
  }

  const elapsedMs = Math.max(0.002, Number((performance.now() - start).toFixed(4)));

  if (bestTopic && bestTopic.score >= threshold && bestTopic.inKnowledgeBase) {
    const entry = kb.map[bestTopic.topicKey];
    return {
      answer: entry.answer,
      trace: {
        mode: 'final',
        threshold,
        pipeline,
        topicScores,
        winningTopicKey: bestTopic.topicKey,
        winningTopicDisplay: bestTopic.displayName,
        winningScore: bestTopic.score,
        usedFallback: false,
        elapsedMs,
        notes: `Selected "${bestTopic.displayName}" with score ${bestTopic.score} (threshold ≥ ${threshold}).`,
      },
    };
  }

  const bestScore = bestTopic?.score ?? 0;
  const reason =
    bestTopic && bestScore >= threshold && !bestTopic.inKnowledgeBase
      ? `Topic "${bestTopic.displayName}" scored ${bestScore}, but its heading is missing from the Knowledge Base.`
      : `Highest topic score (${bestScore}) is below the threshold (${threshold}).`;

  return {
    answer: FALLBACK_ANSWER,
    trace: {
      mode: 'final',
      threshold,
      pipeline,
      topicScores,
      winningTopicKey: null,
      winningTopicDisplay: null,
      winningScore: bestScore,
      usedFallback: true,
      elapsedMs,
      notes: reason,
    },
  };
}
