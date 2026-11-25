import { useMemo, useState } from 'react';
import {
  Check,
  Download,
  MessageSquare,
  Moon,
  Pencil,
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
  onRenameSession: (id: string, title: string) => void;
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

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
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
  onRenameSession,
  onDeleteSession,
  onClearAll,
  onToggleTheme,
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  const todaySessions = filteredSessions.filter((s) => isToday(s.updatedAt));
  const earlierSessions = filteredSessions.filter((s) => !isToday(s.updatedAt));

  const handleExportHistory = () => {
    const payload = JSON.stringify(sessions, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `folio-desk-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startRename = (session: ChatSession) => {
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const commitRename = (id: string) => {
    onRenameSession(id, editingTitle);
    setEditingId(null);
  };

  const renderSessionRow = (session: ChatSession) => {
    const isSelected = session.id === activeSessionId && activeView === 'chat';
    const questionCount = session.messages.filter((m) => m.role === 'user').length;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        className={`group flex items-start justify-between gap-2 rounded-md px-2.5 py-2.5 transition-colors ${
          isSelected
            ? 'bg-emerald-50/80 text-stone-900 dark:bg-emerald-950/50 dark:text-stone-100'
            : 'text-stone-700 hover:bg-stone-100/80 dark:text-stone-300 dark:hover:bg-stone-800/60'
        }`}
      >
        {isEditing ? (
          <div className="flex-1 flex items-center gap-1.5">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename(session.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              className="flex-1 min-w-0 px-2 py-1 text-xs bg-white border border-emerald-600 rounded text-stone-900 focus:outline-none dark:bg-stone-900 dark:text-stone-100"
            />
            <button
              type="button"
              onClick={() => commitRename(session.id)}
              aria-label="Save title"
              className="p-1 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
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
                <MessageSquare
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-stone-400'
                  }`}
                />
                <span className="text-xs font-medium truncate">{session.title}</span>
              </div>
              <div className="mt-1 pl-5.5 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                <span>
                  {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{formatRelativeTime(session.updatedAt)}</span>
              </div>
            </button>
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-0.5 transition-opacity">
              <button
                type="button"
                onClick={() => startRename(session)}
                aria-label={`Rename ${session.title}`}
                className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200/70 dark:hover:bg-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteSession(session.id)}
                aria-label={`Delete ${session.title}`}
                className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-stone-200/70 dark:hover:bg-stone-700 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-72 bg-white border-r border-stone-200 dark:bg-[#111917] dark:border-stone-800">
      {/* Top Search & Mobile Nav */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Navigation & History
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Switcher */}
        <div className="grid grid-cols-2 gap-1.5 md:hidden">
          {(
            [
              { id: 'chat', label: 'Ask Library' },
              { id: 'knowledge', label: 'Knowledge Base' },
              { id: 'rules', label: 'Rule Weights' },
              { id: 'evaluation', label: 'Benchmarks' },
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
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved chats..."
            aria-label="Search saved chats"
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF9F6] border border-stone-200 rounded-md text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 dark:bg-[#0B1110] dark:border-stone-800 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Grouped Session List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Saved History ({filteredSessions.length})
          </span>
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onSelectView('chat');
              onCloseMobile();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-stone-500 dark:text-stone-400">
            No conversations match your search.
          </div>
        ) : (
          <div className="space-y-4">
            {todaySessions.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                  Today
                </div>
                {todaySessions.map(renderSessionRow)}
              </div>
            )}
            {earlierSessions.length > 0 && (
              <div className="space-y-1">
                <div className="px-2 text-[11px] font-medium text-stone-400 dark:text-stone-500">
                  Earlier
                </div>
                {earlierSessions.map(renderSessionRow)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleExportHistory}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800 cursor-pointer"
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
                className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-stone-100 rounded-md transition-colors dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-800 cursor-pointer"
        >
          <span>{isDark ? 'Daylight paper theme' : 'Evening slate theme'}</span>
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block shrink-0 h-full">{sidebarContent}</div>
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
