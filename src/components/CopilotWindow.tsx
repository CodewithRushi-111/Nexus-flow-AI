'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFlow } from '../context/FlowContext';
import { Send, Bot, User, CornerDownLeft, Terminal, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function CopilotWindow() {
  const { state } = useFlow();
  const { zones, stats, alerts, staff, activeIncidentMode } = state;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: "Hello! I am your AI Flow Copilot. I have access to real-time venue telemetry, including sensor densities, wait times, operational alerts, and response crew positions. Ask me anything about venue occupancy, bottlenecks, or traffic dispatch protocols.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What zones currently have critical occupancy?",
    "Where is the longest restroom queue?",
    "Give me an executive summary of the venue stats.",
    "Recommend a staffing plan for the active incident.",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseMarkdown = (text: string) => {
    // Basic Markdown bold and list items
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      // Bold syntax
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      content = content.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="list-item" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      return (
        <p key={idx} className="message-paragraph" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setStatusText('Acquiring neural lock...');

    const statuses = [
      'Ingesting live zone telemetry...',
      'Computing shortest paths...',
      'Querying Gemini 1.5 Flash...',
      'Sanitizing recommendations...',
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      if (statusIndex < statuses.length) {
        setStatusText(statuses[statusIndex]);
        statusIndex++;
      }
    }, 900);

    try {
      // Package venue context to send to API
      const contextPayload = {
        activeIncidentMode,
        stats,
        zones: zones.map((z) => ({
          name: z.name,
          section: z.section,
          type: z.type,
          capacity: z.capacity,
          current: z.current,
          density: z.density,
          waitTime: z.waitTime,
        })),
        alerts: alerts.slice(0, 10).map((a) => ({
          title: a.title,
          message: a.message,
          type: a.type,
          acknowledged: a.acknowledged,
        })),
        staff: staff.map((s) => ({
          name: s.name,
          role: s.role,
          status: s.status,
          task: s.assignedTask,
        })),
      };

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: textToSend,
          context: contextPayload,
        }),
      });

      clearInterval(statusInterval);

      if (!response.ok) {
        throw new Error('API server returned error code.');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      clearInterval(statusInterval);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: "ERROR: Failed to establish secure connection with Flow Neural Core. Please check if Google Gemini API key is configured or verify server logs.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <div className="copilot-window-container glass-panel">
      {/* Logs section */}
      <div className="chat-history custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender}`}>
            <div className="avatar-wrapper">
              {msg.sender === 'assistant' ? (
                <Bot className="avatar-icon ai" />
              ) : (
                <User className="avatar-icon user" />
              )}
            </div>
            <div className="message-bubble">
              <div className="message-header font-mono">
                <span>{msg.sender === 'assistant' ? 'FLOW_COPILOT_CORE' : 'ADMIN_CONSOLE'}</span>
                <span className="time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="message-content">
                {msg.sender === 'assistant' ? (
                  <div className="markdown-body">{parseMarkdown(msg.text)}</div>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row assistant loading-state">
            <div className="avatar-wrapper">
              <Loader2 className="avatar-icon ai spin-animation" />
            </div>
            <div className="message-bubble loading-bubble">
              <div className="loading-container font-mono">
                <Terminal className="term-icon" />
                <span>{statusText}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && !loading && (
        <div className="suggestions-container">
          <span className="suggestion-label font-mono">QUICK DIRECTIVES:</span>
          <div className="suggestions-list">
            {suggestedQuestions.map((q) => (
              <button key={q} onClick={() => handleSend(q)} className="suggestion-item font-sans">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Form */}
      <form onSubmit={handleFormSubmit} className="chat-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Copilot: 'Where is overcrowding critical?' or 'Draft an exit routing protocol'..."
          disabled={loading}
          className="glass-input chat-input"
        />
        <button type="submit" disabled={!inputValue.trim() || loading} className="btn-primary chat-submit">
          <Send className="send-icon" />
          <span className="btn-text">RUN</span>
          <span className="shortcut font-mono"><CornerDownLeft className="shortcut-icon" /></span>
        </button>
      </form>

      <style jsx>{`
        .copilot-window-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 10, 16, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          border-radius: 16px;
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .message-row {
          display: flex;
          gap: 16px;
          max-width: 85%;
        }

        .message-row.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .avatar-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid;
        }

        .user .avatar-wrapper {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .assistant .avatar-wrapper {
          background: rgba(0, 242, 254, 0.05);
          border-color: rgba(0, 242, 254, 0.15);
        }

        .avatar-icon {
          width: 16px;
          height: 16px;
        }

        .avatar-icon.user {
          color: var(--text-secondary);
        }

        .avatar-icon.ai {
          color: var(--primary);
        }

        .spin-animation {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .message-bubble {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
        }

        .user .message-bubble {
          background: rgba(161, 84, 242, 0.04);
          border-color: rgba(161, 84, 242, 0.15);
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 8px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }

        .user .message-header {
          color: rgba(161, 84, 242, 0.8);
        }

        .assistant .message-header {
          color: var(--primary);
        }

        .message-header .time {
          font-weight: 500;
          color: var(--text-dark);
        }

        .message-content {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-primary);
        }

        .markdown-body :global(.message-paragraph) {
          margin-bottom: 10px;
        }

        .markdown-body :global(.message-paragraph:last-child) {
          margin-bottom: 0;
        }

        .markdown-body :global(.list-item) {
          margin-left: 18px;
          list-style-type: square;
          margin-bottom: 6px;
        }

        .markdown-body :global(.inline-code) {
          font-family: var(--font-mono);
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 5px;
          border-radius: 4px;
          color: var(--secondary);
          font-size: 12px;
        }

        .loading-bubble {
          background: rgba(255, 255, 255, 0.01);
          border-color: rgba(255, 255, 255, 0.02);
        }

        .loading-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-dark);
        }

        .term-icon {
          width: 12px;
          height: 12px;
        }

        /* Suggestions */
        .suggestions-container {
          padding: 12px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestion-label {
          font-size: 8px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.1em;
        }

        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .suggestion-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-item:hover {
          background: rgba(0, 242, 254, 0.04);
          border-color: rgba(0, 242, 254, 0.15);
          color: white;
          transform: translateY(-1px);
        }

        /* Form */
        .chat-form {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(8, 8, 14, 0.4);
        }

        .chat-input {
          flex: 1;
          font-size: 13px;
        }

        .chat-submit {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
        }

        .send-icon {
          width: 12px;
          height: 12px;
        }

        .shortcut {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: 4px;
          background: rgba(4, 8, 20, 0.2);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(4, 8, 20, 0.4);
          margin-left: 4px;
        }

        .shortcut-icon {
          width: 10px;
          height: 10px;
        }

        .font-mono {
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}
