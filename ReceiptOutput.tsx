import React, { useState } from 'react';
import { ExtractedReceipt } from '../types';
import { 
  Receipt, 
  Calendar, 
  Tag, 
  CreditCard, 
  Check, 
  Copy, 
  Download, 
  BookmarkPlus, 
  Repeat, 
  Sparkles, 
  FileCode
} from 'lucide-react';

interface Props {
  data: ExtractedReceipt;
  rawText: string;
  onSaveToVault?: (receipt: ExtractedReceipt) => void;
  isSaved?: boolean;
}

export const ReceiptOutput: React.FC<Props> = ({ data, rawText, onSaveToVault, isSaved = false }) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = ['Merchant', 'Amount', 'Currency', 'Date', 'Category', 'IsSubscription', 'PaymentMethod', 'Notes'];
    const row = [
      `"${data.merchant || ''}"`,
      data.amount ?? 0,
      `"${data.currency || '$'}"`,
      `"${data.date || ''}"`,
      `"${data.category || ''}"`,
      data.isSubscription ? 'Yes' : 'No',
      `"${data.paymentMethod || ''}"`,
      `"${data.notes || ''}"`
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `receipt-${(data.merchant || 'expense').toLowerCase().replace(/\s+/g, '-')}-${data.date || 'date'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="receipt-output-container" className="space-y-6">
      {/* Top Banner with Merchant & Main Metric */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{data.merchant || 'Unidentified Merchant'}</h3>
                {data.isSubscription && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Repeat className="w-3 h-3" /> Recurring Sub
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{data.date || 'Date not detected'}</span>
                <span>•</span>
                <Tag className="w-3.5 h-3.5" />
                <span>{data.category || 'General Expense'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Billed</span>
            <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-0.5">
              <span className="text-xl font-semibold text-indigo-600">{data.currency || '$'}</span>
              <span>{typeof data.amount === 'number' ? data.amount.toFixed(2) : data.amount}</span>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Category</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block truncate">{data.category || 'General'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Payment Method</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block truncate flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              {data.paymentMethod || 'Credit Card / UPI'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Tax / Surcharge</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">
              {data.tax !== null && data.tax !== undefined ? `${data.currency || '$'}${data.tax.toFixed(2)}` : 'Included / None'}
            </span>
          </div>
        </div>

        {/* Line Items Table if present */}
        {data.lineItems && data.lineItems.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Itemized Breakdown</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {data.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 px-4 text-sm hover:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    {item.quantity && <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">{item.quantity}x</span>}
                    <span className="text-slate-800 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{data.currency || '$'}{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Life Admin Tip */}
        {data.notes && (
          <div className="mt-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-sm text-indigo-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-xs tracking-wide uppercase text-indigo-700">Admin Intelligence</span>
              <p className="text-indigo-950/80 leading-relaxed">{data.notes}</p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="save-receipt-btn"
              onClick={() => onSaveToVault && onSaveToVault(data)}
              disabled={isSaved}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
              {isSaved ? 'Saved to Vault' : 'Save to Expenses Vault'}
            </button>
            <button
              id="download-csv-btn"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              id="copy-json-btn"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'JSON'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowJson(!showJson)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1 transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}</span>
          </button>
        </div>

        {/* JSON Inspector */}
        {showJson && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};