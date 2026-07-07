import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Loading from './Loading';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy answer"
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 duration-200 border border-white/0 hover:border-white/10 cursor-pointer z-10"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-400 animate-fade-in" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I am Aether, your premium AI assistant. How can I help you today?\n\nTry asking me about:\n* Writing a React component\n* Explaining quantum computing\n* Recommending a book or creative project ideas"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected', 'error', 'checking'
  
  const messagesEndRef = useRef(null);

  // Check backend status on mount
  useEffect(() => {
    // Quick probe to see if backend is up
    axios.post('http://localhost:3000/chat', { question: 'hello' })
      .then(() => setBackendStatus('connected'))
      .catch((err) => {
        console.warn('Backend checking error:', err);
        // It might still work, or it could be offline
        setBackendStatus('error');
      });
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add user message to list
    setMessages(prev => [...prev, { role: 'user', text: userQuestion }]);

    try {
      const response = await axios.post('http://localhost:3000/chat', {
        question: userQuestion
      });

      const aiText = response.data?.finaldata || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      setBackendStatus('connected');
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = "Sorry, I encountered an error connecting to the AI server. Please make sure the backend is running.";
      if (error.response?.data?._message) {
        errorMessage = `Error: ${error.response.data._message}`;
      }
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage, isError: true }]);
      setBackendStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'ai',
        text: "Chat cleared. I am ready for new questions. How can I assist you now?"
      }
    ]);
  };

  const suggestions = [
    "Write a quick Javascript bubble sort function",
    "Explain quantum computing in simple terms",
    "Write a short, engaging description for a tech coffee shop"
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Mesh */}
      <div className="bg-mesh"></div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-h-screen min-h-screen">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 glass-panel border-b lg:border-b-0 lg:border-r flex flex-col justify-between shrink-0">
          <div>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                  Æ
                </div>
                <div>
                  <h1 className="font-semibold text-lg text-white tracking-wide">AetherChat</h1>
                  <p className="text-xs text-neutral-400">Gemini 2.5 Flash</p>
                </div>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                <span className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                  backendStatus === 'error' ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'
                }`}></span>
                <span className="text-[10px] uppercase font-medium text-neutral-300">
                  {backendStatus === 'connected' ? 'Online' : backendStatus === 'error' ? 'Offline' : 'Checking'}
                </span>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="p-6 space-y-6">
              <button 
                onClick={handleClearChat}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Conversation</span>
              </button>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Features</p>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/5">
                    <span className="text-indigo-400 font-semibold">⚡</span>
                    <span>Gemini 2.5 Flash Model response generation.</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/5">
                    <span className="text-indigo-400 font-semibold">📝</span>
                    <span>Supports Markdown formatting, code rendering, lists.</span>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-lg bg-white/5">
                    <span className="text-indigo-400 font-semibold">🎨</span>
                    <span>Glassmorphic, dark theme premium UI details.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-white/5 text-center">
            <span className="text-xs text-neutral-500">v1.1.0 • Designed for Excellence</span>
          </div>
        </aside>

        {/* Chat Window */}
        <main className="flex-1 flex flex-col justify-between overflow-hidden relative">
          
          {/* Top Bar for Mobile */}
          <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white">Æ</div>
              <span className="font-semibold text-white">AetherChat</span>
            </div>
            <button 
              onClick={handleClearChat}
              className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white"
            >
              Clear
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-4 animate-fade-in ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AI Avatar */}
                  {msg.role === 'ai' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shrink-0 flex items-center justify-center font-semibold text-white shadow-md text-sm">
                      AI
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`relative group max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600/90 text-white border-indigo-500/50 rounded-tr-none glow-indigo' 
                      : msg.isError
                        ? 'bg-rose-950/45 text-rose-200 border-rose-900/50 rounded-tl-none'
                        : 'glass-panel-light text-neutral-100 border-white/5 rounded-tl-none'
                  }`}>
                    {/* Copy Button for AI Messages */}
                    {msg.role === 'ai' && !msg.isError && (
                      <CopyButton text={msg.text} />
                    )}

                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="markdown-body pr-6">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-700 to-neutral-600 shrink-0 flex items-center justify-center font-semibold text-white shadow-md text-sm">
                      U
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-4 animate-fade-in">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shrink-0 flex items-center justify-center font-semibold text-white shadow-md text-sm">
                    AI
                  </div>
                  <div className="glass-panel-light text-neutral-100 border border-white/5 rounded-2xl rounded-tl-none px-5 py-2.5">
                    <Loading />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Suggestions (Shown only when chat is fresh or empty) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-6 pb-2 max-w-4xl mx-auto w-full hidden sm:block">
              <p className="text-xs text-neutral-400 mb-3 font-medium text-center">Suggestions to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sug)}
                    className="p-3 text-left rounded-xl glass-panel-light hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 text-xs text-neutral-300 hover:text-white transition-all duration-250 cursor-pointer animate-fade-in"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-6 border-t border-white/5 max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AetherChat..."
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] text-white placeholder-neutral-400 py-4 pl-5 pr-14 rounded-2xl border border-white/10 focus:border-indigo-500/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm shadow-inner disabled:opacity-50"
              />
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-neutral-800 disabled:text-neutral-500 transition-all duration-200 cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-center text-neutral-500 mt-3">
              AetherChat may display inaccurate information, please verify important facts.
            </p>
          </div>

        </main>

      </div>
    </div>
  );
}

export default App;
