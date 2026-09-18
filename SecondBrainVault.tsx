import React, { useState } from 'react';
import { ExtractedReceipt, MeetingActionItem, ExtractedSubscription } from '../types';
import { 
  Receipt, 
  CheckSquare, 
  CreditCard, 
  Trash2, 
  Download, 
  Search, 
  Square,
} from 'lucide-react';

interface Props {
  receipts: ExtractedReceipt[];
  actionItems: MeetingActionItem[];
  subscriptions: ExtractedSubscription[];
  onDeleteReceipt: (id: string) => void;
  onToggleActionItem: (id: string) => void;
  onDeleteActionItem: (id: string) => void;
  onDeleteSubscription: (id: string) => void;
  onClearAll: () => void;
}

export const SecondBrainVault: React.FC<Props> = ({
  receipts,
  actionItems,
  subscriptions,
  onDeleteReceipt,
  onToggleActionItem,
  onDeleteActionItem,
  onDeleteSubscription,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = useState<'receipts' | 'tasks' | 'subscriptions'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Calculations
  const totalExpense = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const pendingTasks = actionItems.filter(t => !t.completed).length;
  const totalMonthlySubs = subscriptions.reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.cost / 12;
    return sum + s.cost;
  }, 0);

  // Filtered lists
  const filteredReceipts = receipts.filter(r => 
    r.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = actionItems
    .filter(t => {
      if (taskFilter === 'pending') return !t.completed;
      if (taskFilter === 'completed') return t.completed;
      return true;
    })
    .filter(t =>
      t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredSubscriptions = subscriptions.filter(s =>
    s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportAllJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      receipts,
      actionItems,
      subscriptions,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `second-brain-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div id="second-brain-vault" className="space-y-6">
      {/* High level Vault Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('receipts')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            activeTab === 'receipts' 
              ? 'bg-white border-indigo-400 shadow-sm ring-2 ring-indigo-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Logged Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalExpense.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {receipts.length} total receipts saved
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('tasks')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            activeTab === 'tasks' 
              ? 'bg-white border-violet-400 shadow-sm ring-2 ring-violet-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Action Items</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {pendingTasks} <span className="text-sm font-normal text-slate-400">pending</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {actionItems.length} total tasks tracked
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('subscriptions')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            activeTab === 'subscriptions' 
              ? 'bg-white border-emerald-400 shadow-sm ring-2 ring-emerald-100' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Recurring Burn</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalMonthlySubs.toFixed(2)} <span className="text-xs font-normal text-slate-400">/mo</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {subscriptions.length} active subscriptions
          </span>
        </div>
      </div>

      {/* Vault Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'receipts'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧾 Receipts ({receipts.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'tasks'
                ? 'bg-white text-violet-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📝 Tasks ({actionItems.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'subscriptions'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💳 Subscriptions ({subscriptions.length})
          </button>
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vault..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={exportAllJson}
            title="Export full Second Brain vault as JSON"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition shrink-0"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab 1: Receipts List */}
      {activeTab === 'receipts' && (
        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No receipts saved in vault yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Paste an email invoice, payment receipt, or restaurant bill in the Parser to extract and save it here.
              </p>
            </div>
          ) : (
            filteredReceipts.map((r, idx) => (
              <div
                key={r.id || idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-bold text-sm">
                    {r.merchant ? r.merchant.charAt(0).toUpperCase() : '$'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{r.merchant}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{r.date}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">{r.category}</span>
                      {r.isSubscription && (
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-semibold">
                          Sub
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      {r.currency || '$'}{Number(r.amount).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteReceipt(r.id || '')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove from vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Action Items List */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => setTaskFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                taskFilter === 'all' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All ({actionItems.length})
            </button>
            <button
              onClick={() => setTaskFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                taskFilter === 'pending' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Pending ({pendingTasks})
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                taskFilter === 'completed' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Completed ({actionItems.length - pendingTasks})
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No tasks in this view</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Paste meeting notes or transcripts to automatically extract assigned action items.
              </p>
            </div>
          ) : (
            filteredTasks.map(t => (
              <div
                key={t.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 transition ${
                  t.completed ? 'border-slate-200 bg-slate-50/60 opacity-60' : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <div 
                  onClick={() => onToggleActionItem(t.id)}
                  className="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1"
                >
                  <div className="shrink-0 text-violet-600">
                    {t.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.task}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-600">@{t.assignee}</span>
                      <span>•</span>
                      <span>Due: {t.dueDate || 'Soon'}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        t.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteActionItem(t.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Subscriptions List */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-3">
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No subscriptions tracked yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Paste bank statements or subscription notifications in the Parser to audit recurring charges.
              </p>
            </div>
          ) : (
            filteredSubscriptions.map(s => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                    {s.serviceName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{s.serviceName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.cancellationRecommendation === 'Cancel'
                          ? 'bg-rose-100 text-rose-700'
                          : s.cancellationRecommendation === 'Keep'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.cancellationRecommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{s.category}</span>
                      <span>•</span>
                      <span>Renews: {s.nextRenewalDate || 'Monthly'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      ${s.cost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase">/{s.billingCycle}</span>
                  </div>
                  <button
                    onClick={() => onDeleteSubscription(s.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove subscription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};