import React from 'react';
import { Play, Sparkles, Code2, Key, RefreshCw, HelpCircle } from 'lucide-react';

export default function Header({
  onVisualize,
  isExecuting,
  selectedPreset,
  onSelectPreset,
  onToggleAiDrawer,
  apiKey,
  onOpenApiKeyModal,
  hasSteps
}) {
  const PRESETS = [
    { id: 'twosum', name: 'Two Sum (Hash Map)' },
    { id: 'bubblesort', name: 'Bubble Sort' },
    { id: 'binarysearch', name: 'Binary Search' },
    { id: 'fibonacci', name: 'Fibonacci Recursion' },
  ];

  return (
    <header className="glass-panel" style={{
      height: '60px',
      margin: '12px 16px 0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 50
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
        }}>
          <Code2 size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AlgoViz <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)', marginLeft: '6px' }}>Python</span>
          </h1>
        </div>
      </div>

      {/* Preset selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Examples:</span>
        <select
          value={selectedPreset}
          onChange={(e) => onSelectPreset(e.target.value)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* API Key Modal Button */}
        <button
          className="btn-secondary"
          onClick={onOpenApiKeyModal}
          title="Configure Gemini API Key"
          style={{ fontSize: '0.85rem' }}
        >
          <Key size={16} color={apiKey ? '#10b981' : '#9ca3af'} />
          {apiKey ? 'API Key Set' : 'Set Gemini Key'}
        </button>

        {/* AI Tutor Drawer Button */}
        <button
          className="btn-secondary glow-pulse"
          onClick={onToggleAiDrawer}
          style={{
            borderColor: 'rgba(139, 92, 246, 0.4)',
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#c4b5fd',
            fontSize: '0.85rem'
          }}
        >
          <Sparkles size={16} color="#a78bfa" />
          AI Tutor Chat
        </button>

        {/* Visualize Button */}
        <button
          className="btn-primary"
          onClick={onVisualize}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              Executing...
            </>
          ) : (
            <>
              <Play size={16} fill="white" />
              Visualize Execution
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
