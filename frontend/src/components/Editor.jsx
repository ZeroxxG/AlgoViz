import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor({ code, onChange, activeLine }) {
  const handleEditorDidMount = (editor, monaco) => {
    // Custom editor configuration if needed
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', monospace",
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 12, bottom: 12 },
    });
  };

  return (
    <div className="glass-panel" style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }}></span>
          main.py
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Editable Code
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
