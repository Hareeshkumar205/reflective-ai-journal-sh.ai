import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Lightbulb, 
  FileText, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  Cpu, 
  Clock, 
  CornerDownLeft,
  BookMarked
} from 'lucide-react';
import { JournalEntry, ReflectionMode, ChatMessage } from '../types';

interface JournalEditorProps {
  entry: JournalEntry | null;
  onSaveEntry: (entry: JournalEntry) => Promise<void>;
  onGenerateReflection: (
    prompt: string,
    mode: ReflectionMode,
    history: ChatMessage[],
    currentTitle: string
  ) => Promise<{
    response: string;
    summary?: string;
    suggestedTitle?: string;
    modelUsed: string;
  }>;
  isSaving: boolean;
  userId: string;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  entry,
  onSaveEntry,
  onGenerateReflection,
  isSaving,
  userId,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>(entry?.mode || 'reflect');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [localTitle, setLocalTitle] = useState(entry?.title || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (entry) {
      setSelectedMode(entry.mode);
      setLocalTitle(entry.title);
      setErrorMessage(null);
    } else {
      setSelectedMode('reflect');
      setLocalTitle('');
      setInputText('');
      setErrorMessage(null);
    }
  }, [entry?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry?.messages, isGenerating]);

  const quickStarters = [
    { label: 'Explore a current dilemma', text: 'I am struggling with a decision between two options: ', mode: 'reflect' as ReflectionMode },
    { label: 'Brainstorm creative angles', text: 'Brainstorm unconventional ideas and action steps for: ', mode: 'brainstorm' as ReflectionMode },
    { label: 'Synthesize daily lessons', text: 'Here is what happened today, help me synthesize key takeaways: ', mode: 'summarize' as ReflectionMode },
    { label: 'Clarify emotional state', text: 'I want to unpack why I felt stressed or triggered earlier when: ', mode: 'reflect' as ReflectionMode },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isGenerating) return;

    setErrorMessage(null);
    setIsGenerating(true);

    const now = Date.now();
    const userMsgId = 'msg-' + now;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: now,
    };

    const currentHistory = entry?.messages || [];
    const updatedMessagesWithUser = [...currentHistory, userMessage];

    try {
      // 1. Call Gemini API via server proxy
      const aiResult = await onGenerateReflection(
        trimmed,
        selectedMode,
        currentHistory,
        localTitle || entry?.title || ''
      );

      const modelMsgId = 'msg-' + (now + 1);
      const modelMessage: ChatMessage = {
        id: modelMsgId,
        role: 'model',
        content: aiResult.response,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessagesWithUser, modelMessage];
      const assignedTitle = localTitle || aiResult.suggestedTitle || entry?.title || 'Personal Reflection';

      const updatedEntry: JournalEntry = {
        id: entry?.id || 'entry-' + now,
        userId,
        title: assignedTitle,
        summary: aiResult.summary || entry?.summary || trimmed.slice(0, 120),
        initialPrompt: entry?.initialPrompt || trimmed,
        messages: finalMessages,
        mode: selectedMode,
        createdAt: entry?.createdAt || now,
        updatedAt: Date.now(),
      };

      // 2. Persist to Firestore with transaction verification
      await onSaveEntry(updatedEntry);

      // 3. Clear input buffer ONLY after verified completion
      setInputText('');
      setLocalTitle(assignedTitle);
    } catch (err: unknown) {
      console.error('Reflection interaction failed:', err);
      setErrorMessage((err as Error)?.message || 'An error occurred during reflection or save. Your text is safely kept in the input box so you can retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-hidden">
      {/* Session Top Header */}
      <div className="border-b border-stone-200 bg-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex-1 min-w-[200px]">
          <input
            id="session-title-input"
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Untitled Reflection (auto-generated on send)..."
            className="w-full font-semibold text-stone-900 text-base sm:text-lg bg-transparent border-b border-transparent hover:border-stone-200 focus:border-amber-400 focus:outline-hidden px-1 py-0.5 transition-colors"
          />
          {entry?.summary && (
            <p className="text-xs text-stone-500 line-clamp-1 px-1 mt-0.5">
              {entry.summary}
            </p>
          )}
        </div>

        {/* Mode selector pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <button
            type="button"
            id="mode-reflect"
            onClick={() => setSelectedMode('reflect')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedMode === 'reflect'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Reflect</span>
          </button>

          <button
            type="button"
            id="mode-brainstorm"
            onClick={() => setSelectedMode('brainstorm')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedMode === 'brainstorm'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Brainstorm</span>
          </button>

          <button
            type="button"
            id="mode-summarize"
            onClick={() => setSelectedMode('summarize')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedMode === 'summarize'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3 h-3 text-indigo-600" />
            <span>Summarize</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div 
          id="editor-error-banner"
          className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start justify-between gap-3 shadow-2xs"
          role="alert"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operation Failed</p>
              <p className="text-stone-600">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isGenerating}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            Retry Send
          </button>
        </div>
      )}

      {/* Conversation Thread / Dialogue Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {(!entry?.messages || entry.messages.length === 0) ? (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-800">
              <BookMarked className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-stone-900">
                Begin a New Reflection
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Write freely about what is on your mind. Gemini will offer perspective, extract insights, or brainstorm pathways forward.
              </p>
            </div>

            {/* Quick Inspiration chips */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto">
              {quickStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputText(starter.text);
                    setSelectedMode(starter.mode);
                    textareaRef.current?.focus();
                  }}
                  className="p-3 rounded-xl bg-white border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 text-left transition-all text-xs text-stone-700 shadow-2xs group cursor-pointer"
                >
                  <p className="font-semibold text-stone-900 text-[11px] group-hover:text-amber-800 flex items-center gap-1.5">
                    {starter.mode === 'brainstorm' && <Lightbulb className="w-3 h-3 text-amber-500" />}
                    {starter.mode === 'summarize' && <FileText className="w-3 h-3 text-indigo-500" />}
                    {starter.mode === 'reflect' && <Sparkles className="w-3 h-3 text-amber-600" />}
                    {starter.label}
                  </p>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    "{starter.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {entry.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-medium text-stone-600">
                      {isUser ? 'You' : 'Gemini 3.6 Flash'}
                    </span>
                    <span className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed max-w-[90%] sm:max-w-[85%] shadow-2xs ${
                      isUser
                        ? 'bg-stone-900 text-stone-50 rounded-tr-xs'
                        : 'bg-white border border-stone-200/80 text-stone-800 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="prose prose-stone prose-sm max-w-none text-stone-800">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                          <span className="inline-flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-amber-600" /> Resilient AI Inference
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Copy to clipboard"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex flex-col items-start max-w-3xl">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-medium text-stone-600">Gemini 3.6 Flash</span>
                  <span className="text-[10px] text-amber-600 font-medium">Reflecting...</span>
                </div>
                <div className="bg-white border border-stone-200/80 rounded-2xl rounded-tl-xs p-4 sm:p-5 text-sm text-stone-600 shadow-2xs flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Synthesizing observations and structured thoughts...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer Box */}
      <div className="border-t border-stone-200 bg-white p-4 sm:p-6 shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto space-y-2">
          <div className="relative border border-stone-300 rounded-2xl focus-within:border-stone-500 focus-within:ring-1 focus-within:ring-stone-500 bg-white transition-all shadow-2xs">
            <textarea
              id="reflection-input-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              rows={3}
              placeholder={`Write your ${selectedMode} reflection here... (Press Cmd/Ctrl + Enter to send)`}
              className="w-full px-4 pt-3 pb-12 text-sm text-stone-900 bg-transparent resize-none focus:outline-hidden placeholder:text-stone-400"
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="text-[11px] text-stone-600 hidden sm:inline">
                  {inputText.length} / 8,000 characters
                </span>
                <span className="text-[11px] text-stone-500 hidden md:inline">
                  • Cmd/Ctrl+Enter
                </span>
              </div>

              <button
                id="submit-reflection-button"
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="pointer-events-auto flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Reflect with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 px-1">
            <span>Interactions isolated to Firestore collection: <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded text-[10px]">/users/{userId.slice(0, 8)}.../interactions</code></span>
            <span>{isSaving ? 'Saving transaction...' : 'All changes auto-saved'}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
