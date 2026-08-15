import React from 'react';
import { Layers, Terminal, Variable } from 'lucide-react';

export default function VariablePanel({ stepData }) {
  if (!stepData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No step data available. Click <strong>Visualize Execution</strong> to run code.
      </div>
    );
  }

  const { locals = {}, stdout = '', stack = [], func_name = '', return_value } = stepData;

  // Separate variables into Primitives vs Collections (lists/dicts)
  const primitives = [];
  const collections = [];

  Object.entries(locals).forEach(([name, varObj]) => {
    if (['list', 'dict', 'set', 'tuple'].includes(varObj.type)) {
      collections.push({ name, ...varObj });
    } else {
      primitives.push({ name, ...varObj });
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
      
      {/* 1. Primitive Variables Panel */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <Variable size={16} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Local Variables</h3>
        </div>

        {primitives.length === 0 && collections.length === 0 ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', italic: 'true' }}>No variables declared yet</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {primitives.map(({ name, type, repr }) => (
              <div
                key={name}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem'
                }}
              >
                <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-code)', fontWeight: 600 }}>{name}</span>
                <span style={{ color: 'var(--text-dim)' }}>=</span>
                <span style={{ color: '#fef08a', fontFamily: 'var(--font-code)' }}>{repr}</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-dim)', padding: '1px 5px', borderRadius: '4px' }}>{type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Collection Visualizer (Lists & Dicts) */}
      {collections.map(({ name, type, value, repr, length }) => (
        <div key={name} className="glass-panel" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)', fontFamily: 'var(--font-code)' }}>
              {name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({type}, len={length})</span>
            </span>
          </div>

          {/* List Array Visualization */}
          {type === 'list' && Array.isArray(value) && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
              {value.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '46px'
                  }}
                >
                  {/* Element Box */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(56, 189, 248, 0.25))',
                      border: '1px solid rgba(124, 58, 237, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.repr}
                  </div>
                  {/* Index Label */}
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--font-code)' }}>
                    [{idx}]
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Dict Visualization */}
          {type === 'dict' && typeof value === 'object' && value !== null && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(value).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-code)'
                  }}
                >
                  <span style={{ color: '#38bdf8' }}>{k}</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>:</span>
                  <span style={{ color: '#a78bfa' }}>{v.repr}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 3. Call Stack Frame */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={16} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Call Stack</h3>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
            &lt;module&gt;
          </span>
          {stack.map((func, i) => (
            <React.Fragment key={i}>
              <span style={{ color: 'var(--text-dim)' }}>→</span>
              <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fef08a', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                {func}()
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4. Console Standard Output Log */}
      <div className="glass-panel" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Terminal size={16} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Console Output (stdout)</h3>
        </div>
        <pre style={{
          background: '#040711',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-code)',
          color: '#34d399',
          minHeight: '40px',
          maxHeight: '100px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {stdout || <span style={{ color: 'var(--text-dim)' }}>(No output yet)</span>}
        </pre>
      </div>

    </div>
  );
}
