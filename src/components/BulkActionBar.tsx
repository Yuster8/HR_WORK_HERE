import React, { useState } from 'react';
import { Trash2, FileCheck2, Download, X, CheckSquare, Building2, ChevronDown } from 'lucide-react';
import { ContractSignedStatus, EmployeeStatus } from '../types/hr';

interface BulkActionBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  departments: string[];
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onRequestBulkDelete: () => void;
  onBulkUpdateStatus: (status: EmployeeStatus) => void;
  onBulkUpdateContract: (signed: ContractSignedStatus) => void;
  onBulkUpdateDepartment: (department: string) => void;
  onExportSelected: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalFilteredCount,
  departments,
  onSelectAllFiltered,
  onClearSelection,
  onRequestBulkDelete,
  onBulkUpdateStatus,
  onBulkUpdateContract,
  onBulkUpdateDepartment,
  onExportSelected,
}) => {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [contractMenuOpen, setContractMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-slate-800 shadow-sm">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-semibold tabular-nums">
          <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{selectedCount} selected</span>
        </div>

        {selectedCount < totalFilteredCount && (
          <button
            type="button"
            onClick={onSelectAllFiltered}
            className="text-xs font-medium text-blue-300 hover:text-blue-200 underline underline-offset-2 whitespace-nowrap shrink-0"
          >
            Select all {totalFilteredCount} matching
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Bulk Status Update */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setStatusMenuOpen((v) => !v);
              setDeptMenuOpen(false);
              setContractMenuOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Set Status</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {statusMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-44 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-lg py-1 z-30"
              onMouseLeave={() => setStatusMenuOpen(false)}
            >
              {(['Active', 'Probation', 'On Leave', 'Terminated'] as EmployeeStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onBulkUpdateStatus(st);
                    setStatusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition-colors"
                >
                  Mark as {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Department Change */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDeptMenuOpen((v) => !v);
              setStatusMenuOpen(false);
              setContractMenuOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Move Dept</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {deptMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-48 max-h-56 overflow-y-auto bg-white text-slate-800 rounded-lg border border-slate-200 shadow-lg py-1 z-30"
              onMouseLeave={() => setDeptMenuOpen(false)}
            >
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => {
                    onBulkUpdateDepartment(dept);
                    setDeptMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition-colors truncate"
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Contract Signed/Not Signed Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setContractMenuOpen((v) => !v);
              setStatusMenuOpen(false);
              setDeptMenuOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Contract</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {contractMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-40 bg-white text-slate-800 rounded-lg border border-slate-200 shadow-lg py-1 z-30"
              onMouseLeave={() => setContractMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  onBulkUpdateContract('Signed');
                  setContractMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-slate-100 transition-colors"
              >
                Signed
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkUpdateContract('Not signed');
                  setContractMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-slate-100 transition-colors"
              >
                Not signed
              </button>
            </div>
          )}
        </div>

        {/* Export Selected */}
        <button
          type="button"
          onClick={onExportSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Selected</span>
        </button>

        {/* Bulk Delete */}
        <button
          type="button"
          onClick={onRequestBulkDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Selected ({selectedCount})</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Clear selection"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
