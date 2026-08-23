import React from 'react';
import { Edit3 } from 'lucide-react';

export default function StepNarrativeBanner({ stepData, code }) {
  if (!stepData) return null;

  const lineNum = stepData.line;
  const event = stepData.event;
  const codeLines = code ? code.split('\n') : [];
  const lineText = lineNum > 0 && lineNum <= codeLines.length ? codeLines[lineNum - 1].trim() : '';

  const frames = stepData.frames || [];
  const currentFrame = frames[frames.length - 1] || {};
  const locals = currentFrame.encoded_locals || {};

  // Build narrative explanation
  let narrative = '';
  if (event === 'return') {
    narrative = `Returning value ${stepData.return_value ? stepData.return_value.repr : 'None'} from ${stepData.func_name}()`;
  } else if (event === 'call') {
    narrative = `Invoking function ${stepData.func_name}()`;
  } else if (lineText.includes('while') || lineText.includes('for')) {
    narrative = `Evaluating loop condition: \`${lineText}\``;
  } else if (lineText.includes('if') || lineText.includes('elif')) {
    narrative = `Evaluating conditional check: \`${lineText}\``;
  } else if (lineText) {
    narrative = `Executing \`${lineText}\``;
  } else {
    narrative = `Stepping to line ${lineNum}`;
  }

  return (
    <div className="minimal-card" style={{
      padding: '12px 18px',
      marginTop: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        padding: '6px',
        borderRadius: '6px',
        background: 'var(--accent-red-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Edit3 size={15} color="var(--accent-red)" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(255, 77, 77, 0.3)',
          fontFamily: 'var(--font-code)'
        }}>
          line {lineNum}
        </span>
        <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
          {narrative}
        </span>
      </div>
    </div>
  );
}
