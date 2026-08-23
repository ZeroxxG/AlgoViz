import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

export default function StepControls({
  currentStep,
  totalSteps,
  onFirst,
  onPrev,
  onNext,
  onLast,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange
}) {
  const isFirst = currentStep <= 0;
  const isLast = currentStep >= totalSteps - 1;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isEditing = 
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'INPUT' ||
        activeEl?.isContentEditable ||
        !!e.target?.closest?.('.monaco-editor') ||
        !!activeEl?.closest?.('.monaco-editor');

      if (isEditing) return;

      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onTogglePlay]);

  return (
    <div className="minimal-card" style={{
      padding: '8px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      background: 'var(--bg-surface)'
    }}>
      {/* Step Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Step <span style={{ color: 'var(--accent-red)', fontSize: '0.95rem' }}>{totalSteps > 0 ? currentStep + 1 : 0}</span> / {totalSteps}
        </span>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn-icon"
          onClick={onFirst}
          disabled={isFirst}
          title="First Step"
          style={{ opacity: isFirst ? 0.3 : 1 }}
        >
          <SkipBack size={16} />
        </button>

        <button
          className="btn-minimal"
          onClick={onPrev}
          disabled={isFirst}
          style={{ opacity: isFirst ? 0.3 : 1, padding: '5px 12px' }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <button
          className="btn-coral"
          onClick={onTogglePlay}
          disabled={totalSteps === 0}
          style={{ padding: '5px 16px' }}
        >
          {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          className="btn-minimal"
          onClick={onNext}
          disabled={isLast}
          style={{ opacity: isLast ? 0.3 : 1, padding: '5px 12px' }}
        >
          Next <ChevronRight size={16} />
        </button>

        <button
          className="btn-icon"
          onClick={onLast}
          disabled={isLast}
          title="Last Step"
          style={{ opacity: isLast ? 0.3 : 1 }}
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Speed Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Gauge size={15} color="var(--text-muted)" />
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Speed:</span>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={2200 - speed}
          onChange={(e) => onSpeedChange(2200 - Number(e.target.value))}
          style={{ width: '75px', accentColor: 'var(--accent-red)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', width: '32px' }}>
          {(1000 / speed).toFixed(1)}x
        </span>
      </div>
    </div>
  );
}
