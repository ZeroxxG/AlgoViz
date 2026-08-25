import React from 'react';
import { Gauge, Cpu, HardDrive, Zap, TrendingUp } from 'lucide-react';

function analyzeDynamicCode(codeStr) {
  if (!codeStr || !codeStr.strip || !codeStr.trim()) {
    return {
      time: 'O(1)',
      space: 'O(1)',
      pct: 20,
      color: '#10b981',
      desc: 'No executable statements'
    };
  }

  const lines = codeStr.split('\n');
  let maxLoopNest = 0;
  let hasLogarithm = false;
  let hasHashMap = false;
  let hasRecursion = false;
  let funcNames = [];

  // Extract function definitions
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('def ')) {
      const match = trimmed.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match && match[1]) funcNames.push(match[1]);
    }
  });

  // Analyze structure line by line
  let currentNest = 0;
  let nestStack = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const indent = line.search(/\S/);

    // Maintain loop nest stack by indentation
    while (nestStack.length > 0 && indent <= nestStack[nestStack.length - 1]) {
      nestStack.pop();
    }

    if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
      nestStack.push(indent);
      if (nestStack.length > maxLoopNest) {
        maxLoopNest = nestStack.length;
      }
    }

    // Check for log patterns
    if (
      trimmed.includes('// 2') ||
      trimmed.includes('//= 2') ||
      trimmed.includes('>> 1') ||
      (trimmed.includes('mid') && (trimmed.includes('low') || trimmed.includes('high')))
    ) {
      hasLogarithm = true;
    }

    // Check for Hash Map / Set usage
    if (
      trimmed.includes('seen') ||
      trimmed.includes('dict(') ||
      trimmed.includes('set(') ||
      trimmed.includes('{}') ||
      (trimmed.includes('in ') && (trimmed.includes('{') || trimmed.includes('dict')))
    ) {
      hasHashMap = true;
    }

    // Check for recursive function call
    funcNames.forEach(fn => {
      if (trimmed.includes(`${fn}(`) && !trimmed.startsWith('def ')) {
        hasRecursion = true;
      }
    });
  });

  // Calculate Big-O metrics based on dynamic analysis
  if (hasRecursion) {
    return {
      time: 'O(2ⁿ)',
      space: 'O(N)',
      pct: 100,
      color: '#ef4444',
      desc: 'Recursive function tree execution detected (exponential call stack)'
    };
  }

  if (maxLoopNest >= 3) {
    return {
      time: 'O(N³)',
      space: 'O(1)',
      pct: 95,
      color: '#f43f5e',
      desc: `Triple nested loop structure detected (${maxLoopNest} levels deep)`
    };
  }

  if (maxLoopNest === 2) {
    return {
      time: 'O(N²)',
      space: 'O(1)',
      pct: 85,
      color: '#f97316',
      desc: 'Nested loops detected (quadratic operations count)'
    };
  }

  if (maxLoopNest === 1) {
    if (hasLogarithm) {
      return {
        time: 'O(N log N)',
        space: 'O(1)',
        pct: 70,
        color: '#f59e0b',
        desc: 'Linear loop with logarithmic sub-division'
      };
    }
    return {
      time: 'O(N)',
      space: hasHashMap ? 'O(N)' : 'O(1)',
      pct: 60,
      color: '#f59e0b',
      desc: hasHashMap ? 'Single pass loop with Hash Map O(N) auxiliary space' : 'Single loop traversal (linear time)'
    };
  }

  if (hasLogarithm) {
    return {
      time: 'O(log N)',
      space: 'O(1)',
      pct: 40,
      color: '#38bdf8',
      desc: 'Logarithmic search space reduction per step'
    };
  }

  return {
    time: 'O(1)',
    space: 'O(1)',
    pct: 20,
    color: '#10b981',
    desc: 'Constant time operations (sequential execution without loops)'
  };
}

export default function ComplexityPanel({ code, totalSteps, selectedPreset, executionTimeMs, backendMetrics }) {
  // Compute dynamic analysis on user code
  const dynamicMetrics = analyzeDynamicCode(code);

  const timeComplexity = backendMetrics ? backendMetrics.time_complexity : dynamicMetrics.time;
  const spaceComplexity = backendMetrics ? backendMetrics.space_complexity : dynamicMetrics.space;
  const complexityExplanation = backendMetrics ? backendMetrics.explanation : dynamicMetrics.desc;
  const meterColor = dynamicMetrics.color;
  const progressPct = dynamicMetrics.pct;

  return (
    <div className="minimal-card" style={{ padding: '14px 16px', marginBottom: '14px', background: 'var(--bg-surface)' }}>
      {/* Header with Execution Time Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={15} color="var(--accent-red)" />
          <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Live Code Complexity</h3>
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
