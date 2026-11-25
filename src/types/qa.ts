export type EngineMode = 'final' | 'original';

export type WorkspaceView = 'chat' | 'knowledge' | 'rules' | 'evaluation';

export interface KnowledgeEntry {
  topicKey: string;
  displayTopic: string;
  answer: string;
  lineNumber: number;
}

export interface ParsedKnowledgeBase {
  entries: KnowledgeEntry[];
  map: Record<string, KnowledgeEntry>;
  skippedLines: { lineNumber: number; text: string; reason: string }[];
}

export interface WeightedKeyword {
  word: string;
  weight: number;
}

export interface RuleTopic {
  topicKey: string;
  displayName: string;
  keywords: WeightedKeyword[];
}

export interface TopicScoreBreakdown {
  topicKey: string;
  displayName: string;
  score: number;
  matchedKeywords: { word: string; weight: number }[];
  inKnowledgeBase: boolean;
}

export interface TokenPipelineTrace {
  rawQuestion: string;
  lowercased: string;
  rawTokens: string[];
  stopWordsRemoved: string[];
  afterStopWords: string[];
  stemmedTokens: string[];
}

export interface ReasoningTrace {
  mode: EngineMode;
  threshold: number;
  pipeline: TokenPipelineTrace;
  topicScores: TopicScoreBreakdown[];
  winningTopicKey: string | null;
  winningTopicDisplay: string | null;
  winningScore: number;
  usedFallback: boolean;
  elapsedMs: number;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  trace?: ReasoningTrace;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface EvalQuestion {
  id: string;
  question: string;
  expectedTopicKey: string | null;
  categoryLabel: string;
  setType: 'main' | 'heldout';
}
