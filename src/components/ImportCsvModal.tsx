import React, { useRef, useState } from 'react';
import { Upload, X, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types/hr';
import { CsvParseResult, parseEmployeesCsv } from '../utils/csv';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (employees: Employee[], mode: 'merge' | 'replace') => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const result = parseEmployeesCsv(content);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!parseResult || parseResult.employees.length === 0) return;
    onImport(parseResult.employees, mode);
    setParseResult(null);
    setFileName('');
    onClose();
  };

  const handleClose = () => {
    setParseResult(null);
    setFileName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-csv-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="import-csv-title" className="text-base font-bold text-slate-900">
              Import Employees from CSV
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports standard CSV exports. Imports are recorded as a single undoable action.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">
              {fileName || 'Choose a CSV file from your computer'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Expected columns: Staff Number, Job Type, Status, Full Name, Department, Gender, Job Position, Supervisor
            </div>
          </div>

          {parseResult && (
            <div className="space-y-4">
              {parseResult.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{parseResult.warnings.join(' ')}</div>
                </div>
              )}

              {parseResult.employees.length > 0 && (
                <>
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Parsed <strong className="tabular-nums">{parseResult.employees.length}</strong>{' '}
                      employee records across {parseResult.detectedColumns.length} columns.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Import Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setMode('merge')}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          mode === 'merge'
                            ? 'border-blue-500 bg-blue-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          Merge &amp; Append
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Updates matching Staff Numbers and adds new rows.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('replace')}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          mode === 'replace'
                            ? 'border-blue-500 bg-blue-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">
                          Replace All Records
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Replaces current dataset with imported CSV rows.
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.employees.length === 0}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              Import {parseResult?.employees.length ? `${parseResult.employees.length} Records` : ''}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
