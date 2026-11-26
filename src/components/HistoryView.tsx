import React from 'react';
import { Undo2, Redo2, RotateCcw, Clock } from 'lucide-react';
import { HistoryRecord } from '../types/hr';

interface HistoryViewProps {
  timeline: HistoryRecord[];
  pointer: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onJumpTo: (index: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  timeline,
  pointer,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onJumpTo,
}) => {
  const ordered = timeline
    .map((entry, idx) => ({ entry, idx }))
    .reverse();

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Undo &amp; Redo Change Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every single edit, bulk delete, CSV import, or alert resolution can be undone or re-applied in one step.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>Redo</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {ordered.map(({ entry, idx }) => {
          const isCurrent = idx === pointer;
          const isFuture = idx > pointer;
          const timeLabel = new Date(entry.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={entry.id}
              className={`px-4 py-3 flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-blue-50/70'
                  : isFuture
                    ? 'bg-slate-50/50 opacity-65'
                    : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{entry.label}</span>
                    {isCurrent && (
                      <span className="text-[11px] font-semibold text-blue-700">
                        · Current State
                      </span>
                    )}
                    {isFuture && (
                      <span className="text-[11px] font-medium text-slate-500">
                        · Undone (Redo available)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                    {timeLabel} · {entry.snapshot.length} total records in roster
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <button
                  type="button"
                  onClick={() => onJumpTo(idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isFuture ? 'Redo to here' : 'Restore'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
