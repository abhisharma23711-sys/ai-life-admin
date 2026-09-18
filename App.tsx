import React, { useState, useEffect } from 'react';
import { TaskType, ExtractedReceipt, ExtractedMeeting, MeetingActionItem, ExtractedSubscription, AnalysisResult } from './types';
import { SAMPLES } from './data/samples';
import { Navbar } from './components/Navbar';
import { ReceiptOutput } from './components/ReceiptOutput';
import { MeetingOutput } from './components/MeetingOutput';
import { SubscriptionOutput } from './components/SubscriptionOutput';
import { SecondBrainVault } from './components/SecondBrainVault';
import { 
  Receipt, 
  CheckSquare, 
  CreditCard, 
  Sparkles, 
  Lightbulb, 
  AlertCircle
} from 'lucide-react';

const INITIAL_RECEIPTS: ExtractedReceipt[] = [
  {
    id: 'rec-1',
    merchant: 'Netflix Inc.',
    amount: 22.99,
    currency: '$',
    date: '2026-09-12',
    category: 'SaaS & Subscriptions',
    isSubscription: true,
    paymentMethod: 'Mastercard ending in 8842',
    notes: 'Premium Ultra HD plan auto-renewed.'
  }
];

const INITIAL_TASKS: MeetingActionItem[] = [
  {
    id: 'task-init-1',
    task: 'Implement simplified 1-step sign-up modal on web',
    assignee: 'Rohan',
    priority: 'High',
    dueDate: 'Sep 20',
    completed: false
  },
  {
    id: 'task-init-2',
    task: 'Deliver mobile Figma components for auth screen',
    assignee: 'Mike',
    priority: 'Medium',
    dueDate: 'Sep 19',
    completed: true
  }
];

const INITIAL_SUBS: ExtractedSubscription[] = [
  {
    id: 'sub-init-1',
    serviceName: 'Adobe Creative Cloud',
    cost: 59.99,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: 'Oct 02, 2026',
    category: 'Software & Design',
    cancellationRecommendation: 'Cancel',
    cancellationRationale: 'Dormant usage over last 90 days. Team moved to Figma.',
    usageLikelihood: 'Dormant',
    howToCancel: 'Account Settings > Plans > Cancel Plan'
  },
  {
    id: 'sub-init-2',
    serviceName: 'Spotify Family',
    cost: 19.99,
    currency: '$',
    billingCycle: 'monthly',
    nextRenewalDate: 'Oct 05, 2026',
    category: 'Entertainment',
    cancellationRecommendation: 'Keep',
    cancellationRationale: 'High utility for 4 active members.',
    usageLikelihood: 'High'
  }
];

export default function App() {
  const [activeView, setActiveView] = useState<'parser' | 'vault'>('parser');
  const [currentTask, setCurrentTask] = useState<TaskType>('receipt');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('life_admin_custom_key') || '');

  // Persistent Vault storage in localStorage
  const [savedReceipts, setSavedReceipts] = useState<ExtractedReceipt[]>(() => {
    try {
      const stored = localStorage.getItem('life_admin_receipts');
      return stored ? JSON.parse(stored) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [savedTasks, setSavedTasks] = useState<MeetingActionItem[]>(() => {
    try {
      const stored = localStorage.getItem('life_admin_tasks');
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [savedSubscriptions, setSavedSubscriptions] = useState<ExtractedSubscription[]>(() => {
    try {
      const stored = localStorage.getItem('life_admin_subs');
      return stored ? JSON.parse(stored) : INITIAL_SUBS;
    } catch {
      return INITIAL_SUBS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('life_admin_receipts', JSON.stringify(savedReceipts));
  }, [savedReceipts]);

  useEffect(() => {
    localStorage.setItem('life_admin_tasks', JSON.stringify(savedTasks));
  }, [savedTasks]);

  useEffect(() => {
    localStorage.setItem('life_admin_subs', JSON.stringify(savedSubscriptions));
  }, [savedSubscriptions]);

  useEffect(() => {
    localStorage.setItem('life_admin_custom_key', customApiKey);
  }, [customApiKey]);

  // Set default placeholder based on active task
  const placeholders: Record<TaskType, string> = {
    receipt: "Paste email receipt, invoice, or SMS notification: 'Paid $22.99 to Netflix on 12th Sept for Premium plan via Mastercard...'",
    meeting: "Paste meeting transcript, slack sync, or raw notes: 'Discussed Q3 launch roadmap. Sarah will finalize the database migration by Monday. Alex to review security compliance...'",
    sub: "Paste bank statement snippet or recurring email alerts: 'Recurring debit of $59.99 from Adobe Creative Cloud, $19.99 from Spotify, and $11.99 from Dropbox...'"
  };

  const handleTaskChange = (task: TaskType) => {
    setCurrentTask(task);
    setErrorMessage(null);
  };

  const loadSample = (sampleText: string) => {
    setUserInput(sampleText);
    setErrorMessage(null);
  };

  const handleProcessData = async () => {
    if (!userInput.trim()) {
      setErrorMessage("Kripya input text paste karein!");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: currentTask,
          text: userInput.trim(),
          apiKeyOverride: customApiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract structured data');
      }

      if (currentTask === 'receipt') {
        const recData: ExtractedReceipt = {
          ...result.data,
          id: `rec-${Date.now()}`,
          rawSnippet: userInput.trim(),
          createdAt: new Date().toISOString(),
        };
        setAnalysisResult({ 
          type: 'receipt', 
          data: recData, 
          rawText: result.rawText, 
          provider: result.provider, 
          notice: result.notice 
        });
      } else if (currentTask === 'meeting') {
        const meetData: ExtractedMeeting = {
          ...result.data,
          id: `meet-${Date.now()}`,
          rawSnippet: userInput.trim(),
          createdAt: new Date().toISOString(),
        };
        setAnalysisResult({ 
          type: 'meeting', 
          data: meetData, 
          rawText: result.rawText, 
          provider: result.provider, 
          notice: result.notice 
        });
      } else {
        setAnalysisResult({ 
          type: 'sub', 
          data: result.data, 
          rawText: result.rawText, 
          provider: result.provider, 
          notice: result.notice 
        });
      }

      setTimeout(() => {
        const element = document.getElementById('result-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Analysis request failed. Please check input.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleProcessData();
    }
  };

  const handleSaveReceipt = (receipt: ExtractedReceipt) => {
    setSavedReceipts(prev => [receipt, ...prev.filter(r => r.id !== receipt.id)]);
  };

  const handleSaveMeeting = (meeting: ExtractedMeeting) => {
    setSavedTasks(prev => [...meeting.actionItems, ...prev]);
  };

  const handleSaveSubscriptions = (subs: ExtractedSubscription[]) => {
    setSavedSubscriptions(prev => {
      const existingIds = new Set(prev.map(s => s.serviceName.toLowerCase()));
      const newItems = subs.filter(s => !existingIds.has(s.serviceName.toLowerCase()));
      return [...newItems, ...prev];
    });
  };

  const vaultCount = savedReceipts.length + savedTasks.filter(t => !t.completed).length + savedSubscriptions.length;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        vaultCount={vaultCount}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:py-8 space-y-8">
        {activeView === 'parser' ? (
          <>
            {/* Header Title Section */}
            <section className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Manual Entry Second Brain</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                🧠 AI Life Admin (MVP)
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Apne raw notes, emails ya receipts paste karo aur actionable insights paao.
              </p>
            </section>

            {/* Main Interactive Parsing Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
              {/* Task Mode Selector Tabs */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-5">
                <button
                  id="tab-receipt"
                  onClick={() => handleTaskChange('receipt')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    currentTask === 'receipt'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>🧾 Extract Receipt/Bill</span>
                </button>

                <button
                  id="tab-meeting"
                  onClick={() => handleTaskChange('meeting')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    currentTask === 'meeting'
                      ? 'bg-white text-violet-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>📝 Meeting Action Items</span>
                </button>

                <button
                  id="tab-sub"
                  onClick={() => handleTaskChange('sub')}
                  className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    currentTask === 'sub'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>💳 Detect Subscriptions</span>
                </button>
              </div>

              {/* Quick Sample Presets */}
              <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick 1-Click Samples:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SAMPLES[currentTask].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSample(sample.text)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Input */}
              <div className="relative">
                <textarea
                  id="userInput"
                  rows={6}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[currentTask]}
                  className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm text-slate-800 placeholder-slate-400 transition leading-relaxed resize-y font-mono sm:font-sans"
                />

                {userInput && (
                  <button
                    onClick={() => setUserInput('')}
                    title="Clear input"
                    className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Bottom Action Row */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[11px] font-mono">⌘/Ctrl + Enter</kbd></span>
                  <span>•</span>
                  <span>{userInput.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <button
                  id="submitBtn"
                  onClick={handleProcessData}
                  disabled={isProcessing || !userInput.trim()}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isProcessing || !userInput.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing & Automating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze & Automate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Section */}
            {analysisResult && (
              <section id="result-section" className="space-y-4 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>📋 Actionable Output</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {analysisResult.provider && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{analysisResult.provider}</span>
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400">
                      Structured Life Admin Output
                    </span>
                  </div>
                </div>

                {analysisResult.notice && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{analysisResult.notice}</span>
                  </div>
                )}

                {analysisResult.type === 'receipt' && (
                  <ReceiptOutput
                    data={analysisResult.data}
                    rawText={analysisResult.rawText}
                    onSaveToVault={handleSaveReceipt}
                    isSaved={savedReceipts.some(r => r.id === analysisResult.data.id)}
                  />
                )}

                {analysisResult.type === 'meeting' && (
                  <MeetingOutput
                    data={analysisResult.data}
                    rawText={analysisResult.rawText}
                    onSaveToVault={handleSaveMeeting}
                    isSaved={savedTasks.some(t => t.id === analysisResult.data.actionItems[0]?.id)}
                  />
                )}

                {analysisResult.type === 'sub' && (
                  <SubscriptionOutput
                    data={analysisResult.data}
                    rawText={analysisResult.rawText}
                    onSaveToVault={handleSaveSubscriptions}
                    isSaved={savedSubscriptions.some(s => s.serviceName === analysisResult.data.subscriptions[0]?.serviceName)}
                  />
                )}
              </section>
            )}

            {/* MVP Key Features Guide Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 mb-2">
                  MVP Architecture & Core Capabilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">⚡ Instant Parsing</span>
                    <p className="text-slate-500 leading-relaxed">
                      Unstructured receipts, notes, ya emails se structured data extract karta hai in realtime.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">🔒 Full-Stack Engine</span>
                    <p className="text-slate-500 leading-relaxed">
                      Server-side Gemini 3.1 Flash Lite model provides high accuracy JSON without exposing API keys.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-800 block mb-1">🎯 3 Core Use-Cases</span>
                    <p className="text-slate-500 leading-relaxed">
                      Expense/Receipt Tracking, Meeting Task Automation, aur Subscription Detection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Second Brain Vault View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  🗄️ Second Brain Vault
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Saved expenses, meeting action items, and audited subscriptions.
                </p>
              </div>

              <button
                onClick={() => setActiveView('parser')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Back to Parser</span>
              </button>
            </div>

            <SecondBrainVault
              receipts={savedReceipts}
              actionItems={savedTasks}
              subscriptions={savedSubscriptions}
              onDeleteReceipt={(id) => setSavedReceipts(prev => prev.filter(r => r.id !== id))}
              onToggleActionItem={(id) => setSavedTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))}
              onDeleteActionItem={(id) => setSavedTasks(prev => prev.filter(t => t.id !== id))}
              onDeleteSubscription={(id) => setSavedSubscriptions(prev => prev.filter(s => s.id !== id))}
              onClearAll={() => {
                if (window.confirm("Clear all items in your Second Brain vault?")) {
                  setSavedReceipts([]);
                  setSavedTasks([]);
                  setSavedSubscriptions([]);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Life Admin • Second Brain MVP</span>
          <span>Powered by Gemini 3.1 Flash Lite & Google AI Studio</span>
        </div>
      </footer>
    </div>
  );
}