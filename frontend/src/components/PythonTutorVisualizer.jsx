import React, { useEffect, useRef, useState } from 'react';
import { Layers, Box, Terminal } from 'lucide-react';

export default function PythonTutorVisualizer({ stepData }) {
  const containerRef = useRef(null);
  const [connections, setConnections] = useState([]);

  const frames = stepData ? (stepData.frames || []) : [];
  const heap = stepData ? (stepData.heap || {}) : {};
  const stdout = stepData ? (stepData.stdout || '') : '';
  const returnVal = stepData ? stepData.return_value : null;

  // Calculate SVG arrow paths from socket elements to target heap cards
  const updatePointers = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newConns = [];

    // Find all socket elements with data-target-ref attribute
    const sockets = containerRef.current.querySelectorAll('[data-target-ref]');

    sockets.forEach((socket) => {
      const targetId = socket.getAttribute('data-target-ref');
      const targetEl = containerRef.current.querySelector(`#heap-${targetId}`);

      if (socket && targetEl) {
        const sRect = socket.getBoundingClientRect();
        const tRect = targetEl.getBoundingClientRect();

        // Calculate relative SVG coordinates
        const x1 = sRect.left + sRect.width / 2 - containerRect.left;
        const y1 = sRect.top + sRect.height / 2 - containerRect.top;

        const x2 = tRect.left - containerRect.left;
        const y2 = tRect.top + 20 - containerRect.top;

        // Curved Bezier path control points
        const deltaX = Math.abs(x2 - x1);
        const cp1x = x1 + deltaX * 0.5;
        const cp1y = y1;
        const cp2x = x2 - deltaX * 0.5;
        const cp2y = y2;

        const pathD = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

        newConns.push({ id: `${socket.id}->${targetId}`, pathD });
      }
    });

    setConnections(newConns);
  };

  useEffect(() => {
    // Re-draw arrows whenever step changes or DOM updates
    const timer = setTimeout(updatePointers, 50);
    window.addEventListener('resize', updatePointers);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePointers);
    };
  }, [stepData]);

  if (!stepData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Click <strong>Visualize Execution</strong> to trace stack frames & heap memory graph line-by-line.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-dark)'
      }}
    >
      {/* Console Output Bar */}
      <div className="minimal-card" style={{ padding: '10px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Terminal size={14} color="var(--accent-red)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Print output (stdout)
          </span>
        </div>
        <pre style={{
          background: '#040406',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-code)',
          color: '#34d399',
          minHeight: '28px',
          maxHeight: '60px',
          overflowY: 'auto'
        }}>
          {stdout || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>(no output)</span>}
        </pre>
      </div>

      {/* Main Memory Layout: Frames Left | Objects Right */}
      <div style={{ flex: 1, display: 'flex', gap: '48px', position: 'relative', minHeight: '350px' }}>
        
        {/* SVG Arrow Overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="6"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
            </marker>
          </defs>
          {connections.map(c => (
            <path
              key={c.id}
              d={c.pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              opacity="0.85"
            />
          ))}
        </svg>

        {/* Column 1: Frames (Call Stack) */}
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <Layers size={15} color="var(--accent-red)" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Frames</h3>
          </div>

          {frames.map((frame, fIdx) => (
            <div
              key={frame.frame_id}
              className="minimal-card"
              style={{
                padding: '12px',
                borderColor: frame.is_global ? 'var(--border-subtle)' : 'rgba(255, 77, 77, 0.4)',
                background: frame.is_global ? 'var(--bg-surface)' : 'rgba(255, 77, 77, 0.05)'
              }}
            >
              {/* Frame Title */}
              <div style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: frame.is_global ? 'var(--text-main)' : 'var(--accent-red)',
                marginBottom: '10px',
                fontFamily: 'var(--font-code)'
              }}>
                {frame.name}
              </div>

              {/* Local Variable Bindings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(frame.encoded_locals).map(([varName, varVal], vIdx) => {
                  const socketId = `socket-${frame.frame_id}-${varName}`;
                  const isRef = varVal && varVal.type === 'ref';

                  return (
                    <div
                      key={varName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-code)'
                      }}
                    >
                      <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{varName}</span>

                      {isRef ? (
                        <div
                          id={socketId}
                          data-target-ref={varVal.ref}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#38bdf8',
                            boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
                            cursor: 'pointer'
                          }}
                        />
                      ) : (
                        <span style={{ color: '#fef08a', fontWeight: 600 }}>
                          {varVal.repr}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Return Value for Return Event */}
                {stepData.event === 'return' && fIdx === frames.length - 1 && stepData.return_value && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-code)',
                    marginTop: '4px'
                  }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>Return value</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>{stepData.return_value.repr}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Objects (Heap Space) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <Box size={15} color="#38bdf8" />
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Objects</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
            {Object.entries(heap).map(([objId, objData]) => (
              <div
                key={objId}
                id={`heap-${objId}`}
                className="minimal-card"
                style={{
                  padding: '10px 14px',
                  minWidth: '120px',
                  background: 'var(--bg-surface)'
                }}
              >
                {/* Object Type Tag */}
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--text-dim)',
                  marginBottom: '6px',
                  fontFamily: 'var(--font-code)'
                }}>
                  {objData.type}
                </div>

                {/* List Container (Python Tutor Grid with Index cells) */}
                {objData.type === 'list' && (
                  <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                    {objData.elements.map((elem, idx) => {
                      const isElemRef = elem && elem.type === 'ref';
                      const cellSocketId = `socket-${objId}-elem-${idx}`;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRight: idx < objData.elements.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            minWidth: '38px',
                            background: '#16161a'
                          }}
                        >
                          {/* Index Header */}
                          <div style={{
                            width: '100%',
                            textAlign: 'center',
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 0',
                            fontFamily: 'var(--font-code)'
                          }}>
                            {idx}
                          </div>
                          {/* Value / Socket Cell */}
                          <div style={{
                            padding: '8px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-code)',
                            fontSize: '0.82rem',
                            color: '#ffffff',
                            fontWeight: 600
                          }}>
                            {isElemRef ? (
                              <div
                                id={cellSocketId}
                                data-target-ref={elem.ref}
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  background: '#38bdf8',
                                  boxShadow: '0 0 6px rgba(56, 189, 248, 0.6)'
                                }}
                              />
                            ) : (
                              elem.repr
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Function Object */}
                {objData.type === 'function' && (
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
                    {objData.name}({objData.params.join(', ')})
                  </div>
                )}

                {/* Dict Container */}
                {objData.type === 'dict' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {objData.entries.map((entry, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                        <span style={{ color: '#38bdf8' }}>{entry.key.repr}</span>
                        <span style={{ color: 'var(--text-dim)' }}>:</span>
                        <span style={{ color: '#fef08a' }}>{entry.val.repr}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
