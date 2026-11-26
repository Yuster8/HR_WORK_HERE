import React from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { Employee } from '../types/hr';

interface ConfirmBulkDeleteModalProps {
  isOpen: boolean;
  selectedEmployees: Employee[];
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmBulkDeleteModal: React.FC<ConfirmBulkDeleteModalProps> = ({
  isOpen,
  selectedEmployees,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || selectedEmployees.length === 0) return null;

  const previewList = selectedEmployees.slice(0, 6);
  const remaining = selectedEmployees.length - previewList.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-delete-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 id="bulk-delete-title" className="text-sm font-bold text-slate-900">
              Delete {selectedEmployees.length} Selected Employees
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You are about to remove{' '}
            <strong className="font-semibold text-slate-900 tabular-nums">
              {selectedEmployees.length}
            </strong>{' '}
            employee records from the active roster in a single batch.
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200/70 max-h-44 overflow-y-auto">
            {previewList.map((emp) => (
              <div
                key={emp.id}
                className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-medium text-slate-800 truncate">{emp.fullName}</span>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  {emp.staffNumber}
                </span>
              </div>
            ))}
            {remaining > 0 && (
              <div className="px-3 py-2 text-[11px] font-medium text-slate-500">
                + {remaining} more selected employee{remaining === 1 ? '' : 's'}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-800">
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>
              You can restore all {selectedEmployees.length} records at once with{' '}
              <strong>Undo (Ctrl+Z)</strong> and re-apply with <strong>Redo (Ctrl+Y)</strong>.
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Delete {selectedEmployees.length} Employees
          </button>
        </div>
      </div>
    </div>
  );
};
