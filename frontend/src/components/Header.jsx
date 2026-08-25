import React from 'react';
import { Play, Sparkles, Code2, Key, RefreshCw, GitBranch } from 'lucide-react';

export default function Header({
  onVisualize,
  isExecuting,
  selectedPreset,
  onSelectPreset,
  onToggleAiDrawer,
  apiKey,
  onOpenApiKeyModal,
  onPushToGithub,
  isPushing
}) {
  const PRESETS = [
    { id: 'minarrows', name: 'Min Arrow Shots (Points)' },
    { id: 'twosum', name: 'Two Sum (Hash Map)' },
    { id: 'bubblesort', name: 'Bubble Sort' },
    { id: 'binarysearch', name: 'Binary Search' },
    { id: 'fibonacci', name: 'Fibonacci Recursion' },
  ];

  return (
    <header className="minimal-card" style={{
      height: '56px',
      margin: '12px 16px 0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 18px',
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px var(--accent-red-glow)'
        }}>
          <Code2 size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
            AlgoViz <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: '6px', background: 'var(--accent-red-subtle)', color: 'var(--accent-red)', border: '1px solid rgba(255, 77, 77, 0.3)', marginLeft: '6px' }}>Python Tutor</span>
          </h1>
        </div>
      </div>

      {/* Preset Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preset:</span>
        <select
          value={selectedPreset}
          onChange={(e) => onSelectPreset(e.target.value)}
          style={{
            background: 'var(--bg-dark)',
            color: 'var(--text-main)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {PRESETS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Push to GitHub button */}
        <button
          className="btn-minimal"
          onClick={onPushToGithub}
          disabled={isPushing}
          title="Commit & Push changes to GitHub repository"
        >
          <GitBranch size={15} color={isPushing ? '#f59e0b' : 'var(--text-muted)'} />
          {isPushing ? 'Pushing...' : 'Push GitHub'}
        </button>

        {/* API Key Modal Button */}
        <button
          className="btn-minimal"
          onClick={onOpenApiKeyModal}
          title="Configure Gemini API Key"
        >
          <Key size={15} color={apiKey ? '#10b981' : '#9ca3af'} />
          {apiKey ? 'Key Set' : 'Gemini Key'}
        </button>

        {/* AI Tutor Drawer Button */}
        <button
          className="btn-minimal"
          onClick={onToggleAiDrawer}
          style={{
            borderColor: 'rgba(255, 77, 77, 0.3)',
            background: 'var(--accent-red-subtle)',
            color: '#fff'
          }}
        >
          <Sparkles size={15} color="var(--accent-red)" />
          AI Tutor
        </button>

        {/* Visualize Button */}
        <button
          className="btn-coral"
          onClick={onVisualize}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              Tracing...
            </>
          ) : (
            <>
              <Play size={15} fill="white" />
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
