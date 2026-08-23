import React from 'react';
import PythonTutorVisualizer from './PythonTutorVisualizer';
import DsaPointerVisualizer from './DsaPointerVisualizer';
import StepNarrativeBanner from './StepNarrativeBanner';
import ComplexityPanel from './ComplexityPanel';

export default function Visualizer({ code, currentStep, steps, selectedPreset }) {
  const stepData = steps[currentStep] || null;
  const activeLine = stepData ? stepData.line : -1;
  const codeLines = code.split('\n');

  return (
    <div style={{ flex: 1, display: 'flex', gap: '14px', height: '100%', overflow: 'hidden' }}>
      
      {/* Left Column: Code Snapshot & Step Narrative Banner */}
      <div style={{ flex: '0 0 36%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="minimal-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Execution Snapshot
            </span>
            {stepData && (
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: stepData.event === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-red-subtle)',
                color: stepData.event === 'error' ? '#fca5a5' : 'var(--accent-red)',
                border: `1px solid ${stepData.event === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(255,77,77,0.3)'}`
              }}>
                Line {stepData.line} ({stepData.event})
              </span>
            )}
          </div>

          {/* Code View with Red Active Line Highlight */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 0',
            fontFamily: 'var(--font-code)',
            fontSize: '0.85rem',
            background: 'var(--bg-dark)'
          }}>
            {codeLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLine;
              return (
                <div
                  key={idx}
                  className={isActive ? 'active-line-row' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 14px',
                    borderLeft: isActive ? '3px solid var(--accent-red)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{
                    width: '28px',
                    color: isActive ? 'var(--accent-red)' : 'var(--text-dim)',
                    fontWeight: isActive ? 700 : 400,
                    fontSize: '0.78rem',
                    userSelect: 'none'
                  }}>
                    {lineNum}
                  </span>
                  <pre style={{
                    margin: 0,
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'pre'
                  }}>
                    {lineText || ' '}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Line Narrative Banner */}
        <StepNarrativeBanner stepData={stepData} code={code} />
      </div>

      {/* Right Column: Complexity Meter, Pointer Array Visualizer & Python Tutor Memory Graph */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '12px' }}>
        
        {/* Complexity Panel */}
        <ComplexityPanel code={code} totalSteps={steps.length} selectedPreset={selectedPreset} />

        {/* DSA Pointer Array Visualizer */}
        <DsaPointerVisualizer stepData={stepData} />

        {/* Python Tutor Memory Frames & Objects Diagram */}
        <div className="minimal-card" style={{ flex: 1, minHeight: '300px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PythonTutorVisualizer stepData={stepData} />
        </div>

      </div>

    </div>
  );
}
