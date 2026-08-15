import React from 'react';
import VariablePanel from './VariablePanel';

export default function Visualizer({ code, currentStep, steps }) {
  const stepData = steps[currentStep] || null;
  const activeLine = stepData ? stepData.line : -1;
  const codeLines = code.split('\n');

  return (
    <div style={{ flex: 1, display: 'flex', gap: '16px', height: '100%', overflow: 'hidden' }}>
      
      {/* Code Snapshot with Highlighted Line */}
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Execution Trace Snapshot
          </span>
          {stepData && (
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: stepData.event === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
              color: stepData.event === 'error' ? '#fca5a5' : '#38bdf8',
              border: `1px solid ${stepData.event === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.4)'}`
            }}>
              Line {stepData.line} ({stepData.event})
            </span>
          )}
        </div>

        {/* Code View */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0',
          fontFamily: 'var(--font-code)',
          fontSize: '0.88rem',
          background: 'var(--bg-panel)'
        }}>
          {codeLines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLine;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 16px',
                  background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--accent-blue)' : '4px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '32px',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-dim)',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '0.8rem',
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

      {/* Variable & State Inspector Panel */}
      <div style={{ flex: '0 0 380px', height: '100%', overflow: 'hidden' }}>
        <VariablePanel stepData={stepData} />
      </div>

    </div>
  );
}
