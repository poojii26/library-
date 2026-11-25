import { useCallback, useMemo, useState } from 'react';
import { ChatWorkspace } from './components/ChatWorkspace';
import { EvaluationLabView } from './components/EvaluationLabView';
import { HistorySidebar } from './components/HistorySidebar';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { RuleEngineView } from './components/RuleEngineView';
import { TopBar } from './components/TopBar';
import { answerQuestion, parseKnowledgeBase } from './engine/libraryQA';
import { usePersistentQAState } from './hooks/useChatHistory';
import { ChatMessage, EngineMode, ReasoningTrace, WorkspaceView } from './types/qa';

export function App() {
  const {
    sessions,
    activeSession,
    activeSessionId,
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
    deleteSession,
    clearAllHistory,
    appendExchange,
    resetDefaults,
  } = usePersistentQAState();

  const [activeView, setActiveView] = useState<WorkspaceView>('chat');
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const kb = useMemo(() => parseKnowledgeBase(libraryText), [libraryText]);

  const handleAskQuestion = useCallback(
    (question: string, overrideMode?: EngineMode): ReasoningTrace | null => {
      const modeToUse = overrideMode ?? engineMode;
      const now = new Date().toISOString();
      const result = answerQuestion(question, kb, ruleBase, {
        mode: modeToUse,
        threshold,
      });

      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: question,
        timestamp: now,
      };

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toISOString(),
        trace: result.trace,
      };

      appendExchange(userMsg, assistantMsg);
      return result.trace;
    },
    [engineMode, kb, ruleBase, threshold, appendExchange]
  );

  const handleRunInChat = useCallback(
    (question: string, mode: EngineMode) => {
      setEngineMode(mode);
      setActiveView('chat');
      handleAskQuestion(question, mode);
    },
    [setEngineMode, handleAskQuestion]
  );

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewChat={createNewChat}
        onToggleSidebar={() => setSidebarOpenMobile((prev) => !prev)}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <HistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          activeView={activeView}
          isDark={isDark}
          isOpenMobile={sidebarOpenMobile}
          onCloseMobile={() => setSidebarOpenMobile(false)}
          onSelectSession={selectSession}
          onSelectView={setActiveView}
          onNewChat={createNewChat}
          onDeleteSession={deleteSession}
          onClearAll={clearAllHistory}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        {activeView === 'chat' && activeSession && (
          <ChatWorkspace
            session={activeSession}
            kb={kb}
            engineMode={engineMode}
            threshold={threshold}
            onChangeEngineMode={setEngineMode}
            onAskQuestion={handleAskQuestion}
            onOpenKnowledgeBase={() => setActiveView('knowledge')}
          />
        )}

        {activeView === 'knowledge' && (
          <KnowledgeBaseView
            libraryText={libraryText}
            kb={kb}
            ruleBase={ruleBase}
            threshold={threshold}
            onUpdateLibraryText={setLibraryText}
            onTestInChat={(q) => handleRunInChat(q, engineMode)}
          />
        )}

        {activeView === 'rules' && (
          <RuleEngineView
            ruleBase={ruleBase}
            threshold={threshold}
            kb={kb}
            onUpdateRuleBase={setRuleBase}
            onUpdateThreshold={setThreshold}
            onResetDefaults={resetDefaults}
          />
        )}

        {activeView === 'evaluation' && (
          <EvaluationLabView
            kb={kb}
            ruleBase={ruleBase}
            threshold={threshold}
            onRunInChat={handleRunInChat}
          />
        )}
      </div>
    </div>
  );
}

export default App;
