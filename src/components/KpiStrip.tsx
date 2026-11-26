import React from 'react';
import { Employee, ColumnFilters } from '../types/hr';

interface KpiStripProps {
  employees: Employee[];
  filters: ColumnFilters;
  onQuickFilter: (patch: Partial<ColumnFilters>) => void;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ employees, filters, onQuickFilter }) => {
  const totalCount = employees.length;
  const blueCollarCount = employees.filter((e) => e.jobType === 'Blue').length;
  const whiteCollarCount = employees.filter((e) => e.jobType === 'White').length;
  const unsignedCount = employees.filter(
    (e) => e.contractSigned === 'Not signed' && e.status !== 'Terminated'
  ).length;

  const isAllActive =
    filters.jobType === 'All' && filters.contractSigned === 'All' && filters.status === 'All';
  const isBlueActive = filters.jobType === 'Blue';
  const isWhiteActive = filters.jobType === 'White';
  const isUnsignedActive = filters.contractSigned === 'Not signed';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
      <button
        type="button"
        onClick={() => onQuickFilter({ jobType: 'All', contractSigned: 'All', status: 'All' })}
        className={`text-left bg-white rounded-xl border p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isAllActive
            ? 'border-blue-300 ring-1 ring-blue-100'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
          {totalCount}
        </div>
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-1.5">
          Total Employees
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onQuickFilter({
            jobType: isBlueActive ? 'All' : 'Blue',
          })
        }
        className={`text-left bg-white rounded-xl border p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isBlueActive
            ? 'border-blue-500 ring-1 ring-blue-200 bg-blue-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
          {blueCollarCount}
        </div>
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-1.5">
          Blue Collar
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onQuickFilter({
            jobType: isWhiteActive ? 'All' : 'White',
          })
        }
        className={`text-left bg-white rounded-xl border p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isWhiteActive
            ? 'border-blue-500 ring-1 ring-blue-200 bg-blue-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">
          {whiteCollarCount}
        </div>
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-1.5">
          White Collar
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onQuickFilter({
            contractSigned: isUnsignedActive ? 'All' : 'Not signed',
          })
        }
        className={`text-left bg-white rounded-xl border p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
          isUnsignedActive
            ? 'border-red-500 ring-1 ring-red-200 bg-red-50/30'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div
          className={`text-2xl font-bold tabular-nums leading-tight ${
            unsignedCount > 0 ? 'text-red-600' : 'text-emerald-600'
          }`}
        >
          {unsignedCount}
        </div>
        <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-1.5">
          Contract Not Signed
        </div>
      </button>
    </div>
  );
};
