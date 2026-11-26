import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSignature,
  CalendarPlus,
  UserCheck,
  Pencil,
} from 'lucide-react';
import { AlertType, Employee, HRAlert } from '../types/hr';

interface AlertsViewProps {
  alerts: HRAlert[];
  employees: Employee[];
  onMarkContractsSigned: (employeeIds: string[]) => void;
  onConfirmProbation: (employeeIds: string[]) => void;
  onExtendProbation: (employeeIds: string[], days: number) => void;
  onRenewContract: (employeeIds: string[], months: number) => void;
  onEditEmployee: (employee: Employee) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  employees,
  onMarkContractsSigned,
  onConfirmProbation,
  onExtendProbation,
  onRenewContract,
  onEditEmployee,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | AlertType>('all');
  const [search, setSearch] = useState('');
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());

  const empMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      unsigned: alerts.filter((a) => a.type === 'unsigned_contract').length,
      probation: alerts.filter(
        (a) => a.type === 'probation_overdue' || a.type === 'probation_upcoming'
      ).length,
      expiring: alerts.filter(
        (a) => a.type === 'contract_expired' || a.type === 'contract_expiring'
      ).length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (!q) return true;
      return (
        a.staffNumber.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
      );
    });
  }, [alerts, typeFilter, search]);

  const toggleAlertSelect = (id: string) => {
    setSelectedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAlerts = filteredAlerts.filter((a) => selectedAlertIds.has(a.id));
  const selectedEmployeeIds = Array.from(new Set(selectedAlerts.map((a) => a.employeeId)));

  const allSelected =
    filteredAlerts.length > 0 && filteredAlerts.every((a) => selectedAlertIds.has(a.id));

  const toggleAllVisible = () => {
    if (allSelected) {
      setSelectedAlertIds(new Set());
    } else {
      setSelectedAlertIds(new Set(filteredAlerts.map((a) => a.id)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={`text-left bg-white rounded-xl border p-4 transition-colors ${
            typeFilter === 'all' ? 'border-blue-500 ring-1 ring-blue-100' : 'border-slate-200'
          }`}
        >
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{counts.all}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Total Active Alerts
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter('unsigned_contract')}
          className={`text-left bg-white rounded-xl border p-4 transition-colors ${
            typeFilter === 'unsigned_contract'
              ? 'border-red-500 ring-1 ring-red-100'
              : 'border-slate-200'
          }`}
        >
          <div className="text-2xl font-bold text-red-600 tabular-nums">{counts.unsigned}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Unsigned Contracts
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter('probation_overdue')}
          className={`text-left bg-white rounded-xl border p-4 transition-colors ${
            typeFilter === 'probation_overdue'
              ? 'border-amber-500 ring-1 ring-amber-100'
              : 'border-slate-200'
          }`}
        >
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{counts.probation}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Probation Reviews
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTypeFilter('contract_expiring')}
          className={`text-left bg-white rounded-xl border p-4 transition-colors ${
            typeFilter === 'contract_expiring'
              ? 'border-blue-500 ring-1 ring-blue-100'
              : 'border-slate-200'
          }`}
        >
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{counts.expiring}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Contract Renewals
          </div>
        </button>
      </div>

      {/* Filter & Bulk Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by name, staff #, or department..."
            className="w-72 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | AlertType)}
            aria-label="Filter alert category"
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Alert Types</option>
            <option value="unsigned_contract">Contract Not Signed</option>
            <option value="probation_overdue">Probation Overdue</option>
            <option value="probation_upcoming">Probation Ending Soon</option>
            <option value="contract_expired">Contract Expired</option>
            <option value="contract_expiring">Contract Expiring Soon</option>
          </select>
        </div>

        {selectedEmployeeIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs">
            <span className="font-semibold tabular-nums">
              {selectedEmployeeIds.length} employee{selectedEmployeeIds.length === 1 ? '' : 's'}{' '}
              selected
            </span>
            <button
              type="button"
              onClick={() => {
                onMarkContractsSigned(selectedEmployeeIds);
                setSelectedAlertIds(new Set());
              }}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 font-medium whitespace-nowrap"
            >
              Mark Contracts Signed
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmProbation(selectedEmployeeIds);
                setSelectedAlertIds(new Set());
              }}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 font-medium whitespace-nowrap"
            >
              Confirm Permanent
            </button>
            <button
              type="button"
              onClick={() => {
                onRenewContract(selectedEmployeeIds, 12);
                setSelectedAlertIds(new Set());
              }}
              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 font-medium whitespace-nowrap"
            >
              Renew +12 Months
            </button>
          </div>
        )}
      </div>

      {/* Alerts List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllVisible}
                    aria-label="Select all alerts"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 whitespace-nowrap">Staff #</th>
                <th className="px-3 py-3 whitespace-nowrap">Employee</th>
                <th className="px-3 py-3 whitespace-nowrap">Department</th>
                <th className="px-3 py-3 whitespace-nowrap">Alert Type</th>
                <th className="px-3 py-3">Details</th>
                <th className="px-3 py-3 whitespace-nowrap">Due / Ref Date</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Quick Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-slate-900">
                      No pending HR alerts in this view
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      All filtered contracts and probation milestones are up to date.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const emp = empMap.get(alert.employeeId);
                  const isSelected = selectedAlertIds.has(alert.id);
                  return (
                    <tr
                      key={alert.id}
                      className={isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}
                    >
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAlertSelect(alert.id)}
                          aria-label={`Select alert for ${alert.fullName}`}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {alert.staffNumber}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{alert.fullName}</div>
                        <div className="text-[11px] text-slate-500">{alert.jobPosition}</div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                        {alert.department}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                          }`}
                        >
                          {alert.severity === 'critical' ? (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{alert.title}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 text-xs">{alert.detail}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {alert.dueDate}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {alert.type === 'unsigned_contract' && (
                            <button
                              type="button"
                              onClick={() => onMarkContractsSigned([alert.employeeId])}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium"
                            >
                              <FileSignature className="w-3 h-3" />
                              <span>Mark Signed</span>
                            </button>
                          )}
                          {(alert.type === 'probation_overdue' ||
                            alert.type === 'probation_upcoming') && (
                            <>
                              <button
                                type="button"
                                onClick={() => onConfirmProbation([alert.employeeId])}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Confirm Active</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onExtendProbation([alert.employeeId], 30)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
                              >
                                <CalendarPlus className="w-3 h-3" />
                                <span>+30d</span>
                              </button>
                            </>
                          )}
                          {(alert.type === 'contract_expired' ||
                            alert.type === 'contract_expiring') && (
                            <button
                              type="button"
                              onClick={() => onRenewContract([alert.employeeId], 12)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span>Renew 1yr</span>
                            </button>
                          )}
                          {emp && (
                            <button
                              type="button"
                              onClick={() => onEditEmployee(emp)}
                              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                              title="Edit full record"
                              aria-label={`Edit ${emp.fullName}`}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
