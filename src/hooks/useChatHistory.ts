import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LIBRARY_TEXT, DEFAULT_RULE_BASE } from '../engine/libraryQA';
import { ChatMessage, ChatSession, EngineMode, RuleTopic } from '../types/qa';

const STORAGE_KEYS = {
  SESSIONS: 'folio_desk_sessions_v1',
  ACTIVE_SESSION_ID: 'folio_desk_active_session_v1',
  LIBRARY_TEXT: 'folio_desk_library_text_v1',
  RULE_BASE: 'folio_desk_rule_base_v1',
  THRESHOLD: 'folio_desk_threshold_v1',
  ENGINE_MODE: 'folio_desk_engine_mode_v1',
  THEME: 'folio_desk_theme_v1',
};

function createEmptySession(): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: 'New conversation',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function usePersistentQAState() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = safeParseJson<ChatSession[]>(
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.SESSIONS) : null,
      []
    );
    return saved.length > 0 ? saved : [createEmptySession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID) : null;
    return savedId || '';
  });

  const [libraryText, setLibraryText] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_LIBRARY_TEXT;
    return localStorage.getItem(STORAGE_KEYS.LIBRARY_TEXT) || DEFAULT_LIBRARY_TEXT;
  });

  const [ruleBase, setRuleBase] = useState<RuleTopic[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_RULE_BASE;
    return safeParseJson<RuleTopic[]>(
      localStorage.getItem(STORAGE_KEYS.RULE_BASE),
      DEFAULT_RULE_BASE
    );
  });

  const [threshold, setThreshold] = useState<number>(() => {
    if (typeof window === 'undefined') return 2;
    const raw = localStorage.getItem(STORAGE_KEYS.THRESHOLD);
    const parsed = raw ? Number(raw) : 2;
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 2;
  });

  const [engineMode, setEngineMode] = useState<EngineMode>(() => {
    if (typeof window === 'undefined') return 'final';
    const raw = localStorage.getItem(STORAGE_KEYS.ENGINE_MODE);
    return raw === 'original' ? 'original' : 'final';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });

  const resolvedActiveId =
    sessions.some((s) => s.id === activeSessionId) ? activeSessionId : sessions[0]?.id ?? '';

  useEffect(() => {
    if (resolvedActiveId && resolvedActiveId !== activeSessionId) {
      setActiveSessionId(resolvedActiveId);
    }
  }, [resolvedActiveId, activeSessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (resolvedActiveId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, resolvedActiveId);
    }
  }, [resolvedActiveId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIBRARY_TEXT, libraryText);
  }, [libraryText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RULE_BASE, JSON.stringify(ruleBase));
  }, [ruleBase]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THRESHOLD, String(threshold));
  }, [threshold]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENGINE_MODE, engineMode);
  }, [engineMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const activeSession =
    sessions.find((s) => s.id === resolvedActiveId) ?? sessions[0];

  const createNewChat = useCallback(() => {
    const current = sessions.find((s) => s.id === resolvedActiveId);
    if (current && current.messages.length === 0) {
      return current.id;
    }
    const fresh = createEmptySession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    return fresh.id;
  }, [sessions, resolvedActiveId]);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const renameSession = useCallback((id: string, newTitle: string) => {
    const clean = newTitle.trim();
    if (!clean) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: clean } : s))
    );
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fresh = createEmptySession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (id === resolvedActiveId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [resolvedActiveId]
  );

  const clearAllHistory = useCallback(() => {
    const fresh = createEmptySession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  }, []);

  const appendExchange = useCallback(
    (userMsg: ChatMessage, assistantMsg: ChatMessage, targetSessionId?: string) => {
      const targetId = targetSessionId || resolvedActiveId;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetId) return s;
          const isFirstTurn = s.messages.length === 0;
          const derivedTitle = isFirstTurn
            ? userMsg.content.length > 48
              ? `${userMsg.content.slice(0, 48).trim()}...`
              : userMsg.content
            : s.title;
          return {
            ...s,
            title: derivedTitle,
            updatedAt: assistantMsg.timestamp,
            messages: [...s.messages, userMsg, assistantMsg],
          };
        })
      );
    },
    [resolvedActiveId]
  );

  const resetDefaults = useCallback(() => {
    setLibraryText(DEFAULT_LIBRARY_TEXT);
    setRuleBase(DEFAULT_RULE_BASE);
    setThreshold(2);
    setEngineMode('final');
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId: resolvedActiveId,
    libraryText,
    setLibraryText,
    ruleBase,
    setRuleBase,
    threshold,
    setThreshold,
    engineMode,
    setEngineMode,
    isDark,
    setIsDark,
    createNewChat,
    selectSession,
    renameSession,
    deleteSession,
    clearAllHistory,
    appendExchange,
    resetDefaults,
  };
}
