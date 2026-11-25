import { useMemo, useState } from 'react';
import {
  Download,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { ChatSession, WorkspaceView } from '../types/qa';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  activeView: WorkspaceView;
  isDark: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectSession: (id: string) => void;
  onSelectView: (view: WorkspaceView) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onToggleTheme: () => void;
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function HistorySidebar({
  sessions,
  activeSessionId,
  activeView,
  isDark,
  isOpenMobile,
  onCloseMobile,
  onSelectSession,
  onSelectView,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onToggleTheme,
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  const handleExportHistory = () => {
    const payload = JSON.stringify(sessions, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lexicon-qa-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-72 bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      {/* Mobile Header & Quick Navigation */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Workspace & History
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Switcher */}
        <div className="grid grid-cols-2 gap-1.5 md:hidden">
          {(
            [
              { id: 'chat', label: 'Chat' },
              { id: 'knowledge', label: 'Knowledge Base' },
              { id: 'rules', label: 'Rule Engine' },
              { id: 'evaluation', label: 'Evaluation' },
            ] as { id: WorkspaceView; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              className={`px-2.5 py-2 text-xs font-medium rounded-md text-left transition-colors ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved chats..."
            aria-label="Search saved chats"
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="flex items-center justify-between px-2 pb-1.5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            History ({filteredSessions.length})
          </span>
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onSelectView('chat');
              onCloseMobile();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No conversations match your search.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isSelected = session.id === activeSessionId && activeView === 'chat';
            const questionCount = session.messages.filter((m) => m.role === 'user').length;
            return (
              <div
                key={session.id}
                className={`group flex items-start justify-between gap-2 rounded-md px-2.5 py-2.5 transition-colors ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectSession(session.id);
                    onSelectView('chat');
                    onCloseMobile();
                  }}
                  className="flex-1 min-w-0 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="text-xs font-medium truncate">{session.title}</span>
                  </div>
                  <div className="mt-1 pl-5.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>
                      {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeTime(session.updatedAt)}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  aria-label={`Delete ${session.title}`}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleExportHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded dark:bg-red-950/60 dark:text-red-300 cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-md transition-colors dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <span>{isDark ? 'Light appearance' : 'Dark appearance'}</span>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Static Rail */}
      <div className="hidden lg:block shrink-0 h-full">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
