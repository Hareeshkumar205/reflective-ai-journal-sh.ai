import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  Trash2, 
  Sparkles, 
  Lightbulb, 
  FileText, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { JournalEntry, ReflectionMode } from '../types';

interface HistorySidebarProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string, e: React.MouseEvent) => void;
  isLoading: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.initialPrompt || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = filterMode === 'all' || entry.mode === filterMode;

    return matchesSearch && matchesMode;
  });

  const getModeBadge = (mode: ReflectionMode) => {
    switch (mode) {
      case 'brainstorm':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            <Lightbulb className="w-2.5 h-2.5" /> Brainstorm
          </span>
        );
      case 'summarize':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
            <FileText className="w-2.5 h-2.5" /> Summary
          </span>
        );
      case 'continue':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            <MessageSquare className="w-2.5 h-2.5" /> Chat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
            <Sparkles className="w-2.5 h-2.5" /> Reflection
          </span>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col h-full bg-white border-r border-stone-200">
      {/* Top CTA */}
      <div className="p-4 border-b border-stone-100 space-y-3">
        <button
          id="new-reflection-button"
          type="button"
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>New Reflection</span>
        </button>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="search-entries-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past reflections..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-400 focus:bg-white transition-colors"
          />
        </div>

        {/* Mode filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {['all', 'reflect', 'brainstorm', 'summarize'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterMode(m)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterMode === m
                  ? 'bg-stone-800 text-stone-50'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List of Entries */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && entries.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs space-y-2">
            <span className="inline-block w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            <p>Loading entries from Firestore...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 px-4 text-center text-stone-400 text-xs space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-stone-300 stroke-1" />
            <p className="font-medium text-stone-600">No reflections found</p>
            <p className="text-[11px]">
              {searchQuery
                ? 'Try adjusting your search or filters.'
                : 'Click "New Reflection" above to begin your first entry.'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = entry.id === selectedEntryId;
            return (
              <div
                key={entry.id}
                id={`entry-item-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50/50 border-amber-300/80 shadow-2xs'
                    : 'bg-white hover:bg-stone-50/80 border-stone-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-xs text-stone-900 line-clamp-1 flex-1">
                    {entry.title || 'Untitled Reflection'}
                  </h4>
                  <span className="text-[10px] text-stone-600 shrink-0">
                    {formatDate(entry.updatedAt || entry.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-normal">
                  {entry.summary || entry.initialPrompt || 'No summary available.'}
                </p>

                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getModeBadge(entry.mode)}
                    <span className="text-[10px] text-stone-600">
                      {entry.messages?.length || 1} msg
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`delete-entry-${entry.id}`}
                      onClick={(e) => onDeleteEntry(entry.id, e)}
                      title="Delete reflection"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-[11px] text-stone-500 flex items-center justify-between">
        <span>{entries.length} saved {entries.length === 1 ? 'reflection' : 'reflections'}</span>
        <span className="text-emerald-700 font-medium">User isolated</span>
      </div>
    </aside>
  );
};
