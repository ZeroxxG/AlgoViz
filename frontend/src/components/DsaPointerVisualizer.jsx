import React from 'react';

const POINTER_COLORS = [
  { name: 'orange', text: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  { name: 'blue', text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8' },
  { name: 'emerald', text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },
  { name: 'purple', text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', border: '#a78bfa' },
  { name: 'amber', text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' }
];

export default function DsaPointerVisualizer({ stepData }) {
  if (!stepData) return null;

  const frames = stepData.frames || [];
  const heap = stepData.heap || {};
  
  // Find current active frame
  const currentFrame = frames[frames.length - 1] || {};
  const locals = currentFrame.encoded_locals || {};

  // Find array lists in heap or locals
  let targetArray = null;
  let arrayName = '';

  Object.entries(locals).forEach(([varName, varVal]) => {
    if (varVal && varVal.type === 'ref' && heap[varVal.ref]) {
      const obj = heap[varVal.ref];
      if (obj.type === 'list' && Array.isArray(obj.elements) && !targetArray) {
        targetArray = obj.elements;
        arrayName = varName;
      }
    }
  });

  if (!targetArray || targetArray.length === 0) {
    return null; // Fallback if no array present in current step
  }

  // Detect index pointer variables (e.g. left, right, i, j, low, high, mid)
  const pointerMap = {}; // index_num -> Array of { name, color }
  let colorIdx = 0;

  Object.entries(locals).forEach(([varName, varVal]) => {
    if (varVal && varVal.type === 'primitive' && typeof varVal.value === 'number') {
      const val = varVal.value;
      if (val >= 0 && val < targetArray.length) {
        const color = POINTER_COLORS[colorIdx % POINTER_COLORS.length];
        colorIdx++;
        if (!pointerMap[val]) pointerMap[val] = [];
        pointerMap[val].push({ name: varName, color });
      }
    }
  });

  return (
    <div className="minimal-card" style={{ padding: '16px 20px', marginBottom: '14px', background: 'var(--bg-surface)' }}>
      {/* Header Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-code)' }}>
          Array Visualization: <span style={{ color: 'var(--accent-red)' }}>{arrayName}</span>
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          len = {targetArray.length}
        </span>
      </div>

      {/* Array Cards Row */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        overflowX: 'auto',
        paddingBottom: '12px',
        paddingTop: '4px'
      }}>
        {targetArray.map((item, idx) => {
          const pointersAtIndex = pointerMap[idx] || [];
          const primaryPointer = pointersAtIndex[0];

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '54px' }}>
              
              {/* Element Card */}
              <div
                style={{
                  width: '54px',
                  height: '58px',
                  borderRadius: '12px',
                  background: primaryPointer ? primaryPointer.color.bg : '#18181c',
                  border: `2px solid ${primaryPointer ? primaryPointer.color.border : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-code)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: primaryPointer ? primaryPointer.color.text : '#ffffff',
                  boxShadow: primaryPointer ? `0 0 14px ${primaryPointer.color.bg}` : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.repr !== undefined ? item.repr : item.value}
              </div>

              {/* Index Label */}
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                marginTop: '6px',
                fontFamily: 'var(--font-code)'
              }}>
                [{idx}]
              </span>

              {/* Pointer Arrows & Badges */}
              {pointersAtIndex.map((p, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '4px'
                  }}
                >
                  <span style={{ color: p.color.text, fontSize: '0.75rem', lineHeight: '1' }}>▲</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: p.color.text,
                    fontFamily: 'var(--font-code)',
                    marginTop: '2px'
                  }}>
                    {p.name}
                  </span>
                </div>
              ))}

            </div>
          );
        })}
      </div>
    </div>
  );
}
