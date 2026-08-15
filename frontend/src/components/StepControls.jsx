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

  // Keyboard shortcut listener (ArrowRight = Next, ArrowLeft = Prev, Space = Play/Pause)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
        return; // Don't trigger when user is typing in code editor or chat input
      }
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
    <div className="glass-panel" style={{
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      background: 'rgba(17, 24, 39, 0.9)'
    }}>
      {/* Step Info Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Step <span style={{ color: 'var(--accent-blue)', fontSize: '1rem' }}>{totalSteps > 0 ? currentStep + 1 : 0}</span> / {totalSteps}
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
          <SkipBack size={18} />
        </button>

        <button
          className="btn-secondary"
          onClick={onPrev}
          disabled={isFirst}
          style={{ opacity: isFirst ? 0.3 : 1, padding: '6px 12px' }}
        >
          <ChevronLeft size={18} /> Prev
        </button>

        <button
          className="btn-primary"
          onClick={onTogglePlay}
          disabled={totalSteps === 0}
          style={{ padding: '6px 16px' }}
        >
          {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <button
          className="btn-secondary"
          onClick={onNext}
          disabled={isLast}
          style={{ opacity: isLast ? 0.3 : 1, padding: '6px 12px' }}
        >
          Next <ChevronRight size={18} />
        </button>

        <button
          className="btn-icon"
          onClick={onLast}
          disabled={isLast}
          title="Last Step"
          style={{ opacity: isLast ? 0.3 : 1 }}
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Speed Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Gauge size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speed:</span>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={2200 - speed} // invert so slider right is faster
          onChange={(e) => onSpeedChange(2200 - Number(e.target.value))}
          style={{ width: '80px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', width: '35px' }}>
          {(1000 / speed).toFixed(1)}x
        </span>
      </div>
    </div>
  );
}
