import React, { useState } from 'react';
import { SubscriptionAnalysisResult, ExtractedSubscription } from '../types';
import { 
  CreditCard, 
  TrendingDown, 
  Copy, 
  Check, 
  BookmarkPlus, 
  FileCode, 
  Sparkles, 
  ShieldAlert
} from 'lucide-react';

interface Props {
  data: SubscriptionAnalysisResult;
  rawText: string;
  onSaveToVault?: (subscriptions: ExtractedSubscription[]) => void;
  isSaved?: boolean;
}

export const SubscriptionOutput: React.FC<Props> = ({ data, rawText, onSaveToVault, isSaved = false }) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleCopyPlan = () => {
    let summaryText = `💳 Subscription Audit Summary:\n`;
    summaryText += `Monthly Spend: $${data.totalMonthlyImpact.toFixed(2)} | Annual: $${data.totalAnnualImpact.toFixed(2)}\n`;
    summaryText += `Potential Savings: $${data.potentialSavings.toFixed(2)} / year\n\n`;
    summaryText += `Action Recommendations:\n`;
    data.subscriptions.forEach(s => {
      summaryText += `- ${s.serviceName} ($${s.cost}/${s.billingCycle}): [${s.cancellationRecommendation.toUpperCase()}] - ${s.cancellationRationale}\n`;
      if (s.howToCancel) {
        summaryText += `  How to cancel: ${s.howToCancel}\n`;
      }
    });
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="subscription-output-container" className="space-y-6">
      {/* High Level Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">Monthly Recurring Burn</span>
          <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
            <span className="text-xl font-semibold text-slate-400">$</span>
            <span>{data.totalMonthlyImpact.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-normal ml-1">/mo</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">Annual Projected Cost</span>
          <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1">
            <span className="text-xl font-semibold text-slate-400">$</span>
            <span>{data.totalAnnualImpact.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-normal ml-1">/year</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-800 block mb-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            Potential Annual Savings
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 flex items-baseline gap-1">
            <span className="text-xl font-semibold text-emerald-600">$</span>
            <span>{data.potentialSavings.toFixed(2)}</span>
            <span className="text-xs text-emerald-600 font-medium ml-1">/year</span>
          </div>
        </div>
      </div>

      {/* AI Executive Summary Banner */}
      {data.summary && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-950 font-medium leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Subscription Breakdown Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Detected Services ({data.subscriptions.length})
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {data.subscriptions.map((sub, idx) => {
            const isCancel = sub.cancellationRecommendation === 'Cancel';
            const isKeep = sub.cancellationRecommendation === 'Keep';

            return (
              <div
                key={sub.id || idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCancel
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : isKeep
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{sub.serviceName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{sub.category || 'Subscription'}</span>
                        <span>•</span>
                        <span>Renews: {sub.nextRenewalDate || 'Monthly'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {sub.currency || '$'}{sub.cost.toFixed(2)}
                      </div>
                      <span className="text-[11px] text-slate-400 uppercase font-medium">/{sub.billingCycle}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      isCancel
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : isKeep
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {sub.cancellationRecommendation}
                    </span>
                  </div>
                </div>

                {/* Rationale & Actions */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Audit Rationale ({sub.usageLikelihood} Usage)
                    </span>
                    <p className="text-slate-700 leading-relaxed">{sub.cancellationRationale}</p>
                  </div>

                  {sub.howToCancel && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                        How to Cancel or Manage
                      </span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[11px] bg-white p-1.5 rounded border border-slate-200">
                        {sub.howToCancel}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            id="save-subs-btn"
            onClick={() => onSaveToVault && onSaveToVault(data.subscriptions)}
            disabled={isSaved}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isSaved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
            {isSaved ? 'Saved to Vault' : 'Save All to Subscriptions Vault'}
          </button>
          <button
            id="copy-plan-btn"
            onClick={handleCopyPlan}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Audit Plan'}</span>
          </button>
        </div>

        <button
          onClick={() => setShowJson(!showJson)}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 transition"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>{showJson ? 'Hide JSON' : 'Inspect JSON'}</span>
        </button>
      </div>

      {/* JSON Inspector */}
      {showJson && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};