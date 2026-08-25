import React from 'react';
import { Gauge, Cpu, HardDrive, Zap, TrendingUp } from 'lucide-react';

export default function ComplexityPanel({ code, totalSteps, selectedPreset, executionTimeMs, backendMetrics }) {
  let timeComplexity = backendMetrics ? backendMetrics.time_complexity : 'O(N)';
  let spaceComplexity = backendMetrics ? backendMetrics.space_complexity : 'O(1)';
  let complexityExplanation = backendMetrics ? backendMetrics.explanation : 'Linear time proportional to input size';

  if (selectedPreset === 'twosum') {
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
    complexityExplanation = 'Single pass with Hash Map lookup O(1)';
  } else if (selectedPreset === 'bubblesort') {
    timeComplexity = 'O(N²)';
    spaceComplexity = 'O(1)';
    complexityExplanation = 'Nested comparison loops (Quadratic Time)';
  } else if (selectedPreset === 'binarysearch') {
    timeComplexity = 'O(log N)';
    spaceComplexity = 'O(1)';
    complexityExplanation = 'Logarithmic search halving search space each step';
  } else if (selectedPreset === 'fibonacci') {
    timeComplexity = 'O(2ⁿ)';
    spaceComplexity = 'O(N)';
    complexityExplanation = 'Exponential recursion tree depth';
  }

  // Calculate complexity progress percentage (O(1)=20%, O(log N)=40%, O(N)=60%, O(N²)=80%, O(2ⁿ)=100%)
  let progressPct = 60;
  let meterColor = '#f59e0b';

  if (timeComplexity.includes('1')) {
    progressPct = 20;
    meterColor = '#10b981';
  } else if (timeComplexity.includes('log')) {
    progressPct = 40;
    meterColor = '#38bdf8';
  } else if (timeComplexity.includes('N²')) {
    progressPct = 85;
    meterColor = '#f97316';
  } else if (timeComplexity.includes('2')) {
    progressPct = 100;
    meterColor = '#ef4444';
  }

  return (
    <div className="minimal-card" style={{ padding: '14px 16px', marginBottom: '14px', background: 'var(--bg-surface)' }}>
      {/* Header with Execution Time Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={15} color="var(--accent-red)" />
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Algorithm Complexity</h3>
        </div>

        {executionTimeMs !== undefined && executionTimeMs !== null && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Zap size={12} color="#38bdf8" /> {executionTimeMs} ms ({totalSteps} steps)
          </span>
        )}
      </div>

      {/* Visual Complexity Meter Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color={meterColor} /> Scale: O(1) → O(2ⁿ)
          </span>
          <span style={{ color: meterColor, fontWeight: 700, fontFamily: 'var(--font-code)' }}>{timeComplexity}</span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: meterColor, borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Time Complexity Card */}
        <div style={{
          background: 'rgba(255, 77, 77, 0.08)',
          border: '1px solid rgba(255, 77, 77, 0.25)',
          borderRadius: '8px',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Cpu size={13} color="var(--accent-red)" /> Time Complexity
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-code)', marginTop: '4px' }}>
            {timeComplexity}
          </div>
        </div>

        {/* Space Complexity Card */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '8px',
          padding: '10px 12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <HardDrive size={13} color="#38bdf8" /> Space Complexity
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-code)', marginTop: '4px' }}>
            {spaceComplexity}
          </div>
        </div>
      </div>

      {/* Explanation Footer */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', fontStyle: 'italic' }}>
        💡 {complexityExplanation}
      </div>
    </div>
  );
}
