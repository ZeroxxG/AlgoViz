import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, X, Bot, User, RefreshCw, Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function ChatDrawer({
  isOpen,
  onClose,
  code,
  currentStep,
  steps,
  apiKey,
  backendUrl
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '👋 **Hello! I am your AlgoViz AI Tutor.**\n\nSubmit code or step through execution, and I will analyze the algorithm pattern, time & space complexity, potential bugs, and explain what happens step by step.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const stepInfo = steps && steps[currentStep] ? steps[currentStep] : null;

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || input.trim();
    if (!promptToSend || loading) return;

    if (!customPrompt) setInput('');

    // Add User message
    const updatedMessages = [...messages, { sender: 'user', text: promptToSend }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/api/chat/`, {
        prompt: promptToSend,
        context: {
          code,
          step_info: stepInfo
        },
        chat_history: updatedMessages,
        api_key: apiKey
      });

      const replyText = res.data.reply || 'No response generated.';
      setMessages(prev => [...prev, { sender: 'ai', text: replyText }]);
    } catch (err) {
      const errText = err.response?.data?.error || err.message || 'Failed to connect to AI server.';
      setMessages(prev => [...prev, { sender: 'ai', text: `❌ **Error**: ${errText}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      top: '84px',
      width: '420px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
    }} className="glass-panel">
      
      {/* Drawer Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(139, 92, 246, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#a78bfa" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6' }}>Gemini AI Code Tutor</h3>
        </div>
        <button className="btn-icon" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <button
          className="btn-secondary"
          onClick={() => handleSend("Identify this algorithm pattern and state best/worst case complexity.")}
          style={{ fontSize: '0.75rem', padding: '4px 8px', whitespace: 'nowrap' }}
        >
          <Zap size={12} color="#f59e0b" /> Complexity & Pattern
        </button>
        <button
          className="btn-secondary"
          onClick={() => handleSend(`Explain what is happening at current line ${stepInfo ? stepInfo.line : 'now'}.`)}
          style={{ fontSize: '0.75rem', padding: '4px 8px', whitespace: 'nowrap' }}
        >
          <Lightbulb size={12} color="#38bdf8" /> Explain Current Step
        </button>
        <button
          className="btn-secondary"
          onClick={() => handleSend("Are there any potential bugs, off-by-one errors, or optimization ideas?")}
          style={{ fontSize: '0.75rem', padding: '4px 8px', whitespace: 'nowrap' }}
        >
          <AlertTriangle size={12} color="#f43f5e" /> Bug Check
        </button>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '10px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={16} color="#fff" />
              </div>
            )}

            <div style={{
              background: msg.sender === 'user' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              borderTopLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
              borderTopRightRadius: msg.sender === 'user' ? '2px' : '12px',
              fontSize: '0.85rem',
              lineHeight: '1.55',
              border: '1px solid var(--border-color)'
            }}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>

            {msg.sender === 'user' && (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--bg-card-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={16} color="#9ca3af" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            Gemini AI is analyzing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI about code, complexity, or steps..."
          style={{
            flex: 1,
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button
          className="btn-primary"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{ padding: '8px 12px' }}
        >
          <Send size={16} />
        </button>
      </div>

    </div>
  );
}
