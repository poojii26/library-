import { Menu, Plus } from 'lucide-react';
import { WorkspaceView } from '../types/qa';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const NAV_ITEMS: { id: WorkspaceView; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'rules', label: 'Rule Engine' },
  { id: 'evaluation', label: 'Evaluation' },
];

export function TopBar({
  activeView,
  onSelectView,
  onNewChat,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-8 dark:border-slate-800 dark:bg-slate-900">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle conversation history"
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onSelectView('chat')}
          className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Lexicon QA
        </button>
      </div>

      {/* Zone 2: Clean Single-Line Nav Links */}
      <nav aria-label="Workspace navigation" className="hidden md:flex items-center gap-7">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`relative py-4 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-700 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onSelectView('chat');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>
    </header>
  );
}
