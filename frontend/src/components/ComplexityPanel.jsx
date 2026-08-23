import React from 'react';
import { Gauge, Cpu, HardDrive } from 'lucide-react';

export default function ComplexityPanel({ code, totalSteps, selectedPreset }) {
  // Infer complexity based on code features & presets
  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';
  let complexityExplanation = 'Linear time proportional to input size';

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
  } else if (code) {
    if (code.includes('for ') && code.count && code.count('for ') >= 2) {
      timeComplexity = 'O(N²)';
      complexityExplanation = 'Nested loops detected';
    } else if (code.includes('// 2') || code.includes('//2')) {
      timeComplexity = 'O(log N)';
      complexityExplanation = 'Divide and conquer halving input';
    }
  }

  return (
    <div className="minimal-card" style={{ padding: '14px 16px', marginBottom: '14px', background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
        <Gauge size={15} color="var(--accent-red)" />
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Algorithm Complexity</h3>
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
