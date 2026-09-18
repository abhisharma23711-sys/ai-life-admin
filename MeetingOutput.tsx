import React, { useState } from 'react';
import { ExtractedMeeting, MeetingActionItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  User, 
  Check, 
  Copy, 
  BookmarkPlus, 
  Sparkles, 
  FileCode,
  CalendarCheck,
  Plus
} from 'lucide-react';

interface Props {
  data: ExtractedMeeting;
  rawText: string;
  onSaveToVault?: (meeting: ExtractedMeeting) => void;
  isSaved?: boolean;
}

export const MeetingOutput: React.FC<Props> = ({ data, rawText, onSaveToVault, isSaved = false }) => {
  const [meetingData, setMeetingData] = useState<ExtractedMeeting>(data);
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleTask = (taskId: string) => {
    setMeetingData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newItem: MeetingActionItem = {
      id: `task-${Date.now()}`,
      task: newTaskInput.trim(),
      assignee: 'Me',
      priority: 'Medium',
      dueDate: 'Upcoming',
      completed: false
    };
    setMeetingData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, newItem]
    }));
    setNewTaskInput('');
    setShowAddForm(false);
  };

  const handleCopyMarkdown = () => {
    let md = `# ${meetingData.meetingTitle || 'Meeting Summary'}\n`;
    md += `Date: ${meetingData.date || 'N/A'}\n\n`;
    md += `## Executive Summary\n${meetingData.summary || ''}\n\n`;
    if (meetingData.keyDecisions?.length) {
      md += `## Key Decisions\n`;
      meetingData.keyDecisions.forEach(d => { md += `- ${d}\n`; });
      md += '\n';
    }
    md += `## Action Items\n`;
    meetingData.actionItems.forEach(a => {
      md += `- [${a.completed ? 'x' : ' '}] **${a.assignee}**: ${a.task} *(Priority: ${a.priority} | Due: ${a.dueDate})*\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportIcs = () => {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Life Admin//Second Brain//EN',
      'CALSCALE:GREGORIAN'
    ];

    meetingData.actionItems.forEach((item, index) => {
      ics.push(
        'BEGIN:VEVENT',
        `UID:ai-task-${Date.now()}-${index}@ailifeadmin`,
        `DTSTAMP:${now}`,
        `SUMMARY:Action Item: ${item.task.replace(/\n/g, ' ')} (${item.assignee})`,
        `DESCRIPTION:Meeting: ${meetingData.meetingTitle || 'Sync'}\\nPriority: ${item.priority}\\nDue: ${item.dueDate || 'Soon'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    ics.push('END:VCALENDAR');
    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(meetingData.meetingTitle || 'meeting-action-items').toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedCount = meetingData.actionItems.filter(t => t.completed).length;
  const totalCount = meetingData.actionItems.length;

  return (
    <div id="meeting-output-container" className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {meetingData.meetingTitle || 'Meeting Action Plan'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{meetingData.date || 'Context Date'}</span>
                {meetingData.followUpDate && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 font-medium">Follow-up: {meetingData.followUpDate}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-violet-50 border border-violet-100 text-xs font-semibold text-violet-700">
              {completedCount} of {totalCount} Completed
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {meetingData.summary && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              Executive Synthesis
            </h4>
            <p className="text-slate-800 text-sm leading-relaxed">{meetingData.summary}</p>
          </div>
        )}

        {/* Key Decisions */}
        {meetingData.keyDecisions && meetingData.keyDecisions.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">Key Decisions Made</h4>
            <div className="space-y-2">
              {meetingData.keyDecisions.map((decision, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{decision}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items Interactive Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Action Items & Assignees</h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Action Item</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddNewTask} className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={e => setNewTaskInput(e.target.value)}
                placeholder="E.g., Alex: Review PR #142 before Friday"
                className="flex-1 text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="space-y-2.5">
            {meetingData.actionItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleTask(item.id)}
                className={`flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  item.completed
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="shrink-0 mt-0.5 sm:mt-0 text-violet-600">
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-violet-600 transition" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-tight ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.task}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    <User className="w-3 h-3 text-slate-400" />
                    {item.assignee}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    item.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : item.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.priority}
                  </span>
                  {item.dueDate && (
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                      {item.dueDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="save-meeting-btn"
              onClick={() => onSaveToVault && onSaveToVault(meetingData)}
              disabled={isSaved}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98]'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
              {isSaved ? 'Saved to Vault' : 'Save Tasks to Vault'}
            </button>
            <button
              id="export-calendar-btn"
              onClick={handleExportIcs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Export tasks to Calendar (.ics)"
            >
              <CalendarCheck className="w-4 h-4 text-violet-600" />
              <span>Calendar (.ics)</span>
            </button>
            <button
              id="copy-markdown-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Markdown'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowJson(!showJson)}
            className="text-xs font-semibold text-slate-500 hover:text-violet-600 inline-flex items-center gap-1 transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showJson ? 'Hide JSON' : 'Inspect JSON'}</span>
          </button>
        </div>

        {/* JSON Inspector */}
        {showJson && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(meetingData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};