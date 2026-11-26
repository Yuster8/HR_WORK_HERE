import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Undo2,
  Redo2,
  X,
  Database,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { KpiStrip } from './components/KpiStrip';
import { BulkActionBar } from './components/BulkActionBar';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeModal } from './components/EmployeeModal';
import { ImportCsvModal } from './components/ImportCsvModal';
import { ConfirmBulkDeleteModal } from './components/ConfirmBulkDeleteModal';
import { AlertsView } from './components/AlertsView';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoryView } from './components/HistoryView';
import { createSampleEmployees } from './data/sampleEmployees';
import { useEmployeeHistory } from './hooks/useEmployeeHistory';
import {
  ActiveView,
  ColumnFilters,
  ContractSignedStatus,
  Employee,
  EmployeeStatus,
  SortConfig,
  SortField,
  YesNo,
} from './types/hr';
import { computeHRAlerts } from './utils/alerts';
import { addDaysSlash, addMonthsSlash } from './utils/autoCompute';
import { exportEmployeesToCsv } from './utils/csv';

const INITIAL_FILTERS: ColumnFilters = {
  keyword: '',
  staffNumber: '',
  jobType: 'All',
  status: 'All',
  fullName: '',
  department: 'All',
  gender: 'All',
  jobPosition: '',
  supervisor: '',
  contractSigned: 'All',
  enrolled: 'All',
  entryDate: '',
  probationEndDate: '',
  contractEndDate: '',
  nationality: '',
  nida: '',
  dateOfBirth: '',
  age: '',
  tin: '',
  nssfNumber: '',
  degree: '',
  phoneNumber: '',
  email: '',
  emergencyContact: '',
  relationship: '',
  emergencyContactPhone: '',
  region: '',
  district: '',
  street: '',
  city: '',
  grossPay28x12: '',
  grossPay30x8: '',
  hourlySalary: '',
  bankBranch: '',
  swiftCode: '',
  sortCode: '',
  account: '',
  observations: '',
};

const TEXT_FILTER_KEYS: Array<keyof Employee & keyof ColumnFilters> = [
  'staffNumber',
  'fullName',
  'jobPosition',
  'supervisor',
  'entryDate',
  'probationEndDate',
  'contractEndDate',
  'nationality',
  'nida',
  'dateOfBirth',
  'age',
  'tin',
  'nssfNumber',
  'degree',
  'phoneNumber',
  'email',
  'emergencyContact',
  'relationship',
  'emergencyContactPhone',
  'region',
  'district',
  'street',
  'city',
  'grossPay28x12',
  'grossPay30x8',
  'hourlySalary',
  'bankBranch',
  'swiftCode',
  'sortCode',
  'account',
  'observations',
];

export default function App() {
  const {
    employees,
    timeline,
    pointer,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    lastFeedback,
    commitChange,
    undo,
    redo,
    jumpTo,
    dismissFeedback,
  } = useEmployeeHistory();

  const [activeView, setActiveView] = useState<ActiveView>('records');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filters, setFilters] = useState<ColumnFilters>(INITIAL_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'staffNumber',
    direction: 'asc',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedIdRef = useRef<string | null>(null);

  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Prune selection when records are removed or restored
  useEffect(() => {
    const validIds = new Set(employees.map((e) => e.id));
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [employees]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const existingStaffNumbers = useMemo(
    () => new Set(employees.map((e) => e.staffNumber.toUpperCase())),
    [employees]
  );

  const alerts = useMemo(() => computeHRAlerts(employees), [employees]);

  const filteredAndSorted = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();

    const filtered = employees.filter((emp) => {
      if (filters.jobType !== 'All' && emp.jobType !== filters.jobType) return false;
      if (filters.status !== 'All' && emp.status !== filters.status) return false;
      if (filters.department !== 'All' && emp.department !== filters.department) return false;
      if (filters.gender !== 'All' && emp.gender !== filters.gender) return false;
      if (filters.contractSigned !== 'All' && emp.contractSigned !== filters.contractSigned)
        return false;
      if (filters.enrolled !== 'All' && emp.enrolled !== filters.enrolled) return false;

      for (const key of TEXT_FILTER_KEYS) {
        const needle = String(filters[key] ?? '').trim().toLowerCase();
        if (needle && !String(emp[key] ?? '').toLowerCase().includes(needle)) {
          return false;
        }
      }

      if (kw) {
        const haystack = [
          emp.staffNumber,
          emp.jobType,
          emp.status,
          emp.fullName,
          emp.department,
          emp.gender,
          emp.jobPosition,
          emp.supervisor,
          emp.contractSigned,
          emp.entryDate,
          emp.probationEndDate,
          emp.contractEndDate,
          emp.nationality,
          emp.nida,
          emp.dateOfBirth,
          emp.age,
          emp.tin,
          emp.nssfNumber,
          emp.degree,
          emp.phoneNumber,
          emp.email,
          emp.emergencyContact,
          emp.relationship,
          emp.emergencyContactPhone,
          emp.region,
          emp.district,
          emp.street,
          emp.city,
          emp.bankBranch,
          emp.account,
          emp.observations,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;
      const mult = direction === 'asc' ? 1 : -1;
      const valA = String(a[field] ?? '');
      const valB = String(b[field] ?? '');
      return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * mult;
    });

    return sorted;
  }, [employees, filters, sortConfig]);

  const selectedEmployeesList = useMemo(
    () => employees.filter((e) => selectedIds.has(e.id)),
    [employees, selectedIds]
  );

  const handleFilterChange = (patch: Partial<ColumnFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    );
  };

  const handleToggleSelect = (id: string, shiftKey: boolean, orderedVisibleIds: string[]) => {
    if (shiftKey && lastSelectedIdRef.current) {
      const startIdx = orderedVisibleIds.indexOf(lastSelectedIdRef.current);
      const endIdx = orderedVisibleIds.indexOf(id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [low, high] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        const rangeIds = orderedVisibleIds.slice(low, high + 1);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          rangeIds.forEach((rid) => next.add(rid));
          return next;
        });
        lastSelectedIdRef.current = id;
        return;
      }
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastSelectedIdRef.current = id;
  };

  const handleToggleSelectPage = (pageIds: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = pageIds.length > 0 && pageIds.every((id) => next.has(id));
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(new Set(filteredAndSorted.map((e) => e.id)));
  };

  const handleSaveEmployee = (data: Omit<Employee, 'id'>, existingId?: string) => {
    if (existingId) {
      commitChange(
        (prev) => prev.map((e) => (e.id === existingId ? { ...data, id: existingId } : e)),
        `Updated ${data.staffNumber} (${data.fullName})`,
        'edit',
        1
      );
    } else {
      const newEmp: Employee = {
        ...data,
        id: `emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      commitChange(
        (prev) => [newEmp, ...prev],
        `Added ${newEmp.staffNumber} (${newEmp.fullName})`,
        'add',
        1
      );
    }
  };

  const handleInlineUpdateContract = (emp: Employee, nextStatus: ContractSignedStatus) => {
    if (emp.contractSigned === nextStatus) return;
    commitChange(
      (prev) => prev.map((e) => (e.id === emp.id ? { ...e, contractSigned: nextStatus } : e)),
      `Set contract "${nextStatus}" for ${emp.staffNumber}`,
      'edit',
      1
    );
  };

  const handleInlineUpdateEnrolled = (emp: Employee, nextValue: YesNo) => {
    if (emp.enrolled === nextValue) return;
    commitChange(
      (prev) => prev.map((e) => (e.id === emp.id ? { ...e, enrolled: nextValue } : e)),
      `Set NSSF Active "${nextValue}" for ${emp.staffNumber}`,
      'edit',
      1
    );
  };

  const handleDeleteSingle = (emp: Employee) => {
    commitChange(
      (prev) => prev.filter((e) => e.id !== emp.id),
      `Deleted ${emp.staffNumber} (${emp.fullName})`,
      'delete',
      1
    );
  };

  const handleConfirmBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const idsToRemove = new Set(selectedIds);
    commitChange(
      (prev) => prev.filter((e) => !idsToRemove.has(e.id)),
      `Deleted ${count} employee${count === 1 ? '' : 's'}`,
      'bulk_delete',
      count
    );
    setSelectedIds(new Set());
  };

  const handleBulkUpdateStatus = (status: EmployeeStatus) => {
    const count = selectedIds.size;
    if (count === 0) return;
    const targetIds = new Set(selectedIds);
    commitChange(
      (prev) => prev.map((e) => (targetIds.has(e.id) ? { ...e, status } : e)),
      `Updated status to ${status} for ${count} employee${count === 1 ? '' : 's'}`,
      'bulk_update',
      count
    );
  };

  const handleBulkUpdateDepartment = (department: string) => {
    const count = selectedIds.size;
    if (count === 0) return;
    const targetIds = new Set(selectedIds);
    commitChange(
      (prev) => prev.map((e) => (targetIds.has(e.id) ? { ...e, department } : e)),
      `Moved ${count} employee${count === 1 ? '' : 's'} to ${department}`,
      'bulk_update',
      count
    );
  };

  const handleBulkUpdateContract = (signed: ContractSignedStatus) => {
    const count = selectedIds.size;
    if (count === 0) return;
    const targetIds = new Set(selectedIds);
    commitChange(
      (prev) => prev.map((e) => (targetIds.has(e.id) ? { ...e, contractSigned: signed } : e)),
      `Marked contract "${signed}" for ${count} employee${count === 1 ? '' : 's'}`,
      'bulk_update',
      count
    );
  };

  const handleImportCsv = (imported: Employee[], mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      commitChange(
        imported,
        `Imported ${imported.length} employees via CSV (replaced roster)`,
        'import',
        imported.length
      );
      setSelectedIds(new Set());
      setPage(1);
      return;
    }

    commitChange(
      (prev) => {
        const byStaff = new Map<string, Employee>();
        prev.forEach((e) => byStaff.set(e.staffNumber.toUpperCase(), e));
        imported.forEach((imp) => {
          const key = imp.staffNumber.toUpperCase();
          const existing = byStaff.get(key);
          byStaff.set(key, existing ? { ...imp, id: existing.id } : imp);
        });
        return Array.from(byStaff.values());
      },
      `Merged ${imported.length} employees via CSV`,
      'import',
      imported.length
    );
  };

  const handleLoadSampleData = () => {
    const sample = createSampleEmployees();
    commitChange(
      sample,
      `Loaded sample HR dataset (${sample.length} employees)`,
      'reset',
      sample.length
    );
    setSelectedIds(new Set());
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  // Alert resolution handlers (all undoable!)
  const handleAlertMarkSigned = (employeeIds: string[]) => {
    const idSet = new Set(employeeIds);
    commitChange(
      (prev) =>
        prev.map((e) => (idSet.has(e.id) ? { ...e, contractSigned: 'Signed' } : e)),
      `Marked contract signed for ${idSet.size} employee${idSet.size === 1 ? '' : 's'}`,
      'alert_action',
      idSet.size
    );
  };

  const handleAlertConfirmProbation = (employeeIds: string[]) => {
    const idSet = new Set(employeeIds);
    commitChange(
      (prev) => prev.map((e) => (idSet.has(e.id) ? { ...e, status: 'Active' } : e)),
      `Confirmed permanent Active status for ${idSet.size} employee${idSet.size === 1 ? '' : 's'}`,
      'alert_action',
      idSet.size
    );
  };

  const handleAlertExtendProbation = (employeeIds: string[], days: number) => {
    const idSet = new Set(employeeIds);
    commitChange(
      (prev) =>
        prev.map((e) =>
          idSet.has(e.id)
            ? { ...e, probationEndDate: addDaysSlash(e.probationEndDate, days) }
            : e
        ),
      `Extended probation by ${days} days for ${idSet.size} employee${idSet.size === 1 ? '' : 's'}`,
      'alert_action',
      idSet.size
    );
  };

  const handleAlertRenewContract = (employeeIds: string[], months: number) => {
    const idSet = new Set(employeeIds);
    commitChange(
      (prev) =>
        prev.map((e) =>
          idSet.has(e.id)
            ? {
                ...e,
                contractEndDate: addMonthsSlash(
                  e.contractEndDate || new Date().toISOString().slice(0, 10),
                  months
                ),
              }
            : e
        ),
      `Renewed contract (+${months} months) for ${idSet.size} employee${
        idSet.size === 1 ? '' : 's'
      }`,
      'alert_action',
      idSet.size
    );
  };

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([k, v]) => v !== INITIAL_FILTERS[k as keyof ColumnFilters]);
  }, [filters]);

  const viewMeta: Record<ActiveView, { title: string; subtitle: string }> = {
    records: {
      title: 'Employee Records',
      subtitle: 'Manage all employee information, search, filter, import and export.',
    },
    alerts: {
      title: 'Probation & Contract Alerts',
      subtitle: 'Review unsigned contracts, upcoming probation reviews, and expiring agreements.',
    },
    analytics: {
      title: 'Workforce Analytics',
      subtitle: 'Department headcount, collar mix, and contract compliance metrics.',
    },
    history: {
      title: 'Change History',
      subtitle: 'Inspect, undo, or redo single edits, bulk deletions, and CSV imports.',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        alertCount={alerts.length}
        historyCount={timeline.length - 1}
        mobileOpen={mobileMenuOpen}
        onToggleMobile={() => setMobileMenuOpen((v) => !v)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="px-5 sm:px-7 py-5 space-y-5 max-w-[1680px]">
          {/* Page Header + Global Undo/Redo Controls */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {viewMeta[activeView].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {viewMeta[activeView].subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={!canUndo}
                onClick={undo}
                title={canUndo ? `Undo: ${undoLabel} (Ctrl+Z)` : 'Nothing to undo'}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                disabled={!canRedo}
                onClick={redo}
                title={canRedo ? `Redo: ${redoLabel} (Ctrl+Y)` : 'Nothing to redo'}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span>Redo</span>
              </button>
            </div>
          </header>

          {activeView === 'records' && (
            <>
              {/* KPI Strip */}
              <KpiStrip
                employees={employees}
                filters={filters}
                onQuickFilter={handleFilterChange}
              />

              {/* Primary Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 min-w-[230px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange({ keyword: e.target.value })}
                    placeholder="Search by keyword (any field)..."
                    aria-label="Search employees by keyword"
                    className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {filters.keyword && (
                    <button
                      type="button"
                      onClick={() => handleFilterChange({ keyword: '' })}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingEmployee(null);
                    setEmployeeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportEmployeesToCsv(employees)}
                  title="Export all employee records into a single CSV file"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV ({employees.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Filters</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Load Sample Data</span>
                </button>
              </div>

              {/* Bulk Selection & Multi-Delete Contextual Bar */}
              <BulkActionBar
                selectedCount={selectedIds.size}
                totalFilteredCount={filteredAndSorted.length}
                departments={departments}
                onSelectAllFiltered={handleSelectAllFiltered}
                onClearSelection={() => setSelectedIds(new Set())}
                onRequestBulkDelete={() => setBulkDeleteModalOpen(true)}
                onBulkUpdateStatus={handleBulkUpdateStatus}
                onBulkUpdateContract={handleBulkUpdateContract}
                onBulkUpdateDepartment={handleBulkUpdateDepartment}
                onExportSelected={() =>
                  exportEmployeesToCsv(
                    selectedEmployeesList,
                    `hr-workbench-selected-${selectedEmployeesList.length}.csv`
                  )
                }
              />

              {/* Main Employee Grid */}
              <EmployeeTable
                employees={filteredAndSorted}
                totalCount={employees.length}
                departments={departments}
                filters={filters}
                onFilterChange={handleFilterChange}
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectPage={handleToggleSelectPage}
                onInlineUpdateContract={handleInlineUpdateContract}
                onInlineUpdateEnrolled={handleInlineUpdateEnrolled}
                onEditEmployee={(emp) => {
                  setEditingEmployee(emp);
                  setEmployeeModalOpen(true);
                }}
                onDeleteEmployee={handleDeleteSingle}
                onAddEmployee={() => {
                  setEditingEmployee(null);
                  setEmployeeModalOpen(true);
                }}
                onResetFilters={handleResetFilters}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )}

          {activeView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              employees={employees}
              onMarkContractsSigned={handleAlertMarkSigned}
              onConfirmProbation={handleAlertConfirmProbation}
              onExtendProbation={handleAlertExtendProbation}
              onRenewContract={handleAlertRenewContract}
              onEditEmployee={(emp) => {
                setEditingEmployee(emp);
                setEmployeeModalOpen(true);
              }}
            />
          )}

          {activeView === 'analytics' && <AnalyticsView employees={employees} />}

          {activeView === 'history' && (
            <HistoryView
              timeline={timeline}
              pointer={pointer}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onJumpTo={jumpTo}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <EmployeeModal
        isOpen={employeeModalOpen}
        employee={editingEmployee}
        existingStaffNumbers={existingStaffNumbers}
        departments={departments}
        onClose={() => {
          setEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
      />

      <ImportCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportCsv}
      />

      <ConfirmBulkDeleteModal
        isOpen={bulkDeleteModalOpen}
        selectedEmployees={selectedEmployeesList}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />

      {/* Non-intrusive Action Feedback Toast with Instant Undo / Redo */}
      {lastFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 flex items-center gap-3 text-xs max-w-md"
        >
          <span className="font-medium truncate">{lastFeedback.message}</span>
          {lastFeedback.canQuickUndo && canUndo && (
            <button
              type="button"
              onClick={undo}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 font-semibold text-white shrink-0"
            >
              Undo
            </button>
          )}
          {lastFeedback.canQuickRedo && canRedo && (
            <button
              type="button"
              onClick={redo}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 font-semibold text-white shrink-0"
            >
              Redo
            </button>
          )}
          <button
            type="button"
            onClick={dismissFeedback}
            className="text-slate-400 hover:text-white p-0.5 shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
