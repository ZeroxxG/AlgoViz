import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Visualizer from './components/Visualizer';
import StepControls from './components/StepControls';
import ChatDrawer from './components/ChatDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8001';

const CODE_PRESETS = {
  twosum: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

result = twoSum([2, 7, 11, 15], 9)
print("Two Sum Indices:", result)
`,
  bubblesort: `def bubbleSort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubbleSort(numbers)
print("Sorted:", sorted_numbers)
`,
  binarysearch: `def binarySearch(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
idx = binarySearch(nums, 23)
print("Found at index:", idx)
`,
  fibonacci: `def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

val = fibonacci(5)
print("Fibonacci(5) =", val)
`
};

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState('twosum');
  const [code, setCode] = useState(CODE_PRESETS.twosum);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const [errorMsg, setErrorMsg] = useState(null);

  // Modals & Drawers
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('algoviz_gemini_key') || '');

  // Auto-play timer ref
  const playTimerRef = useRef(null);

  // Preset switch handler
  const handleSelectPreset = (presetId) => {
    setSelectedPreset(presetId);
    if (CODE_PRESETS[presetId]) {
      setCode(CODE_PRESETS[presetId]);
      setSteps([]);
      setCurrentStep(0);
      setIsPlaying(false);
      setErrorMsg(null);
    }
  };

  // API Key save
  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('algoviz_gemini_key', newKey);
  };

  // Core execution trigger
  const handleVisualize = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    setIsPlaying(false);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/execute/`, { code });
      const fetchedSteps = res.data.steps || [];
      setSteps(fetchedSteps);
      setCurrentStep(0);

      // Check if tracer caught a runtime exception
      const errorStep = fetchedSteps.find(s => s.event === 'error');
      if (errorStep) {
        setErrorMsg(`Runtime Exception: ${errorStep.error}`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Execution failed';
      setErrorMsg(msg);
      setSteps([]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto-play effect
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      clearInterval(playTimerRef.current);
    }
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, speed, steps.length]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg-dark)'
    }}>
      {/* Top Navigation Header */}
      <Header
        onVisualize={handleVisualize}
        isExecuting={isExecuting}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasSteps={steps.length > 0}
      />

      {/* Main Workspace (Split Screen: Code Editor Left | Visualizer Right) */}
      <main style={{
        flex: 1,
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
        overflow: 'hidden'
      }}>
        {/* Left Column: Monaco Code Editor */}
        <div style={{ flex: '0 0 45%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Editor
            code={code}
            onChange={(val) => {
              setCode(val);
              if (steps.length > 0) {
                setSteps([]); // reset trace on edit
                setCurrentStep(0);
              }
            }}
            activeLine={steps[currentStep] ? steps[currentStep].line : -1}
          />
        </div>

        {/* Right Column: Execution Visualizer */}
        <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '0.85rem'
            }}>
              🚨 <strong>Error:</strong> {errorMsg}
            </div>
          )}

          <Visualizer
            code={code}
            currentStep={currentStep}
            steps={steps}
          />
        </div>
      </main>

      {/* Bottom Control Stepper */}
      <div style={{ padding: '0 16px 12px 16px' }}>
        <StepControls
          currentStep={currentStep}
          totalSteps={steps.length}
          onFirst={() => setCurrentStep(0)}
          onPrev={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          onNext={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          onLast={() => setCurrentStep(steps.length - 1)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          speed={speed}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* AI Tutor Side Drawer (Phase 2) */}
      <ChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        code={code}
        currentStep={currentStep}
        steps={steps}
        apiKey={apiKey}
        backendUrl={BACKEND_URL}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}
