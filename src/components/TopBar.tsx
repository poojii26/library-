import { Menu, Plus } from 'lucide-react';
import { WorkspaceView } from '../types/qa';

interface TopBarProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const NAV_ITEMS: { id: WorkspaceView; label: string }[] = [
  { id: 'chat', label: 'Ask Library' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'rules', label: 'Rule Weights' },
  { id: 'evaluation', label: 'Benchmarks' },
];

export function TopBar({
  activeView,
  onSelectView,
  onNewChat,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="h-14 shrink-0 border-b border-stone-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-8 dark:border-stone-800 dark:bg-[#111917]">
      {/* Zone 1: Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle conversation history"
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => onSelectView('chat')}
          className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Folio Desk
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
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-700 dark:bg-emerald-400" />
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
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>
    </header>
  );
}
