import React, { useMemo, useRef } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  ColumnFilters,
  ContractSignedStatus,
  Employee,
  SortConfig,
  SortField,
  YesNo,
} from '../types/hr';

interface EmployeeTableProps {
  employees: Employee[];
  totalCount: number;
  departments: string[];
  filters: ColumnFilters;
  onFilterChange: (patch: Partial<ColumnFilters>) => void;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string, shiftKey: boolean, orderedVisibleIds: string[]) => void;
  onToggleSelectPage: (pageIds: string[]) => void;
  onInlineUpdateContract: (emp: Employee, nextStatus: ContractSignedStatus) => void;
  onInlineUpdateEnrolled: (emp: Employee, nextValue: YesNo) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (emp: Employee) => void;
  onAddEmployee: () => void;
  onResetFilters: () => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function StatusCell({ status }: { status: Employee['status'] }) {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Active</span>
        </span>
      );
    case 'Terminated':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Terminated</span>
        </span>
      );
    case 'Probation':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Probation</span>
        </span>
      );
    case 'On Leave':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 whitespace-nowrap">
          <CalendarOff className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>On Leave</span>
        </span>
      );
  }
}

function AutoTag() {
  return (
    <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-blue-100 text-blue-700">
      AUTO
    </span>
  );
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalCount,
  departments,
  filters,
  onFilterChange,
  sortConfig,
  onSort,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onInlineUpdateContract,
  onInlineUpdateEnrolled,
  onEditEmployee,
  onDeleteEmployee,
  onAddEmployee,
  onResetFilters,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(employees.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedEmployees = useMemo(() => {
    if (pageSize === 0) return employees;
    const start = (safePage - 1) * pageSize;
    return employees.slice(start, start + pageSize);
  }, [employees, safePage, pageSize]);

  const pagedIds = useMemo(() => pagedEmployees.map((e) => e.id), [pagedEmployees]);

  const allOnPageSelected = pagedIds.length > 0 && pagedIds.every((id) => selectedIds.has(id));
  const someOnPageSelected = pagedIds.some((id) => selectedIds.has(id)) && !allOnPageSelected;

  React.useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someOnPageSelected;
    }
  }, [someOnPageSelected]);

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />
    );
  };

  const startIndex =
    employees.length === 0 ? 0 : pageSize === 0 ? 1 : (safePage - 1) * pageSize + 1;
  const endIndex =
    employees.length === 0
      ? 0
      : pageSize === 0
        ? employees.length
        : Math.min(safePage * pageSize, employees.length);

  const renderTextFilter = (
    key: keyof ColumnFilters,
    label: string
  ) => (
    <input
      type="text"
      value={String(filters[key] ?? '')}
      onChange={(e) => onFilterChange({ [key]: e.target.value } as Partial<ColumnFilters>)}
      placeholder="Filter"
      aria-label={`Filter by ${label}`}
      className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
    />
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Table Scroll Container */}
      <div className="overflow-x-auto max-h-[calc(100vh-310px)] min-h-[380px] hr-scrollbar relative">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
            {/* Row 1: Column Headers */}
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="w-10 px-3 py-2.5 border-b border-slate-200/70 bg-slate-50 sticky left-0 z-30">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={() => onToggleSelectPage(pagedIds)}
                  aria-label="Select all employees on current page"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer align-middle"
                />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[105px]">
                <button
                  type="button"
                  onClick={() => onSort('staffNumber')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Staff Number</span>
                  {renderSortIcon('staffNumber')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[95px]">
                <button
                  type="button"
                  onClick={() => onSort('jobType')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Job Type</span>
                  {renderSortIcon('jobType')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                <button
                  type="button"
                  onClick={() => onSort('status')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[235px]">
                <button
                  type="button"
                  onClick={() => onSort('fullName')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Full Name</span>
                  {renderSortIcon('fullName')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[155px]">
                <button
                  type="button"
                  onClick={() => onSort('department')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Department</span>
                  {renderSortIcon('department')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[95px]">
                <button
                  type="button"
                  onClick={() => onSort('gender')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Gender</span>
                  {renderSortIcon('gender')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[190px]">
                <button
                  type="button"
                  onClick={() => onSort('jobPosition')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Job Position</span>
                  {renderSortIcon('jobPosition')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[160px]">
                <button
                  type="button"
                  onClick={() => onSort('supervisor')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Supervisor</span>
                  {renderSortIcon('supervisor')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('contractSigned')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Contract Signed</span>
                  {renderSortIcon('contractSigned')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[95px]">
                <button
                  type="button"
                  onClick={() => onSort('enrolled')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>NSSF Active</span>
                  {renderSortIcon('enrolled')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                <button
                  type="button"
                  onClick={() => onSort('entryDate')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Entry Date</span>
                  {renderSortIcon('entryDate')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('probationEndDate')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>End of Probation</span>
                  {renderSortIcon('probationEndDate')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('contractEndDate')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>End of Contract</span>
                  {renderSortIcon('contractEndDate')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                <button
                  type="button"
                  onClick={() => onSort('nationality')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Nationality</span>
                  {renderSortIcon('nationality')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[185px]">
                <span>NIDA</span>
                <AutoTag />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[135px]">
                <span>Date of Birth</span>
                <AutoTag />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[85px]">
                <button
                  type="button"
                  onClick={() => onSort('age')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Age</span>
                  <AutoTag />
                  {renderSortIcon('age')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                TIN
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                NSSF Number
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[125px]">
                Degree
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[125px]">
                Phone Number
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[210px]">
                Email
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[195px]">
                Emergency Contact
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[115px]">
                Relationship
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[180px]">
                Emergency Contact Phone
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[135px]">
                <button
                  type="button"
                  onClick={() => onSort('region')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>Region</span>
                  {renderSortIcon('region')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[130px]">
                District
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[135px]">
                Street
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('city')}
                  className="group inline-flex items-center gap-1 hover:text-slate-800"
                >
                  <span>City</span>
                  {renderSortIcon('city')}
                </button>
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[155px]">
                <span>Gross Pay (28*12)</span>
                <AutoTag />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[155px]">
                <span>Gross Pay (30*8)</span>
                <AutoTag />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[140px]">
                <span>Hourly Salary</span>
                <AutoTag />
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[125px]">
                Bank Branch
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[110px]">
                Swift Code
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[95px]">
                Sort Code
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[145px]">
                Account
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap min-w-[180px]">
                Observations
              </th>
              <th className="px-3 py-2.5 border-b border-slate-200/70 whitespace-nowrap sticky right-0 z-30 bg-slate-50 border-l border-slate-200 text-right min-w-[115px]">
                Actions
              </th>
            </tr>

            {/* Row 2: Inline Column Filters */}
            <tr className="bg-slate-50/95 border-b border-slate-200">
              <th className="px-3 py-2 bg-slate-50 sticky left-0 z-30" />
              <th className="px-2 py-2">{renderTextFilter('staffNumber', 'Staff Number')}</th>
              <th className="px-2 py-2">
                <select
                  value={filters.jobType}
                  onChange={(e) =>
                    onFilterChange({ jobType: e.target.value as ColumnFilters['jobType'] })
                  }
                  aria-label="Filter by Job Type"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="White">White</option>
                  <option value="Blue">Blue</option>
                </select>
              </th>
              <th className="px-2 py-2">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    onFilterChange({ status: e.target.value as ColumnFilters['status'] })
                  }
                  aria-label="Filter by Status"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </th>
              <th className="px-2 py-2">{renderTextFilter('fullName', 'Full Name')}</th>
              <th className="px-2 py-2">
                <select
                  value={filters.department}
                  onChange={(e) => onFilterChange({ department: e.target.value })}
                  aria-label="Filter by Department"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-2 py-2">
                <select
                  value={filters.gender}
                  onChange={(e) =>
                    onFilterChange({ gender: e.target.value as ColumnFilters['gender'] })
                  }
                  aria-label="Filter by Gender"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </th>
              <th className="px-2 py-2">{renderTextFilter('jobPosition', 'Job Position')}</th>
              <th className="px-2 py-2">{renderTextFilter('supervisor', 'Supervisor')}</th>
              <th className="px-2 py-2">
                <select
                  value={filters.contractSigned}
                  onChange={(e) =>
                    onFilterChange({
                      contractSigned: e.target.value as ColumnFilters['contractSigned'],
                    })
                  }
                  aria-label="Filter by Contract Signed"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Signed">Signed</option>
                  <option value="Not signed">Not signed</option>
                </select>
              </th>
              <th className="px-2 py-2">
                <select
                  value={filters.enrolled}
                  onChange={(e) =>
                    onFilterChange({ enrolled: e.target.value as ColumnFilters['enrolled'] })
                  }
                  aria-label="Filter by NSSF Active"
                  className="w-full px-2 py-1 text-xs font-normal text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </th>
              <th className="px-2 py-2">{renderTextFilter('entryDate', 'Entry Date')}</th>
              <th className="px-2 py-2">
                {renderTextFilter('probationEndDate', 'End of Probation')}
              </th>
              <th className="px-2 py-2">
                {renderTextFilter('contractEndDate', 'End of Contract')}
              </th>
              <th className="px-2 py-2">{renderTextFilter('nationality', 'Nationality')}</th>
              <th className="px-2 py-2">{renderTextFilter('nida', 'NIDA')}</th>
              <th className="px-2 py-2">{renderTextFilter('dateOfBirth', 'Date of Birth')}</th>
              <th className="px-2 py-2">{renderTextFilter('age', 'Age')}</th>
              <th className="px-2 py-2">{renderTextFilter('tin', 'TIN')}</th>
              <th className="px-2 py-2">{renderTextFilter('nssfNumber', 'NSSF Number')}</th>
              <th className="px-2 py-2">{renderTextFilter('degree', 'Degree')}</th>
              <th className="px-2 py-2">{renderTextFilter('phoneNumber', 'Phone Number')}</th>
              <th className="px-2 py-2">{renderTextFilter('email', 'Email')}</th>
              <th className="px-2 py-2">
                {renderTextFilter('emergencyContact', 'Emergency Contact')}
              </th>
              <th className="px-2 py-2">{renderTextFilter('relationship', 'Relationship')}</th>
              <th className="px-2 py-2">
                {renderTextFilter('emergencyContactPhone', 'Emergency Contact Phone')}
              </th>
              <th className="px-2 py-2">{renderTextFilter('region', 'Region')}</th>
              <th className="px-2 py-2">{renderTextFilter('district', 'District')}</th>
              <th className="px-2 py-2">{renderTextFilter('street', 'Street')}</th>
              <th className="px-2 py-2">{renderTextFilter('city', 'City')}</th>
              <th className="px-2 py-2">{renderTextFilter('grossPay28x12', 'Gross Pay 28*12')}</th>
              <th className="px-2 py-2">{renderTextFilter('grossPay30x8', 'Gross Pay 30*8')}</th>
              <th className="px-2 py-2">{renderTextFilter('hourlySalary', 'Hourly Salary')}</th>
              <th className="px-2 py-2">{renderTextFilter('bankBranch', 'Bank Branch')}</th>
              <th className="px-2 py-2">{renderTextFilter('swiftCode', 'Swift Code')}</th>
              <th className="px-2 py-2">{renderTextFilter('sortCode', 'Sort Code')}</th>
              <th className="px-2 py-2">{renderTextFilter('account', 'Account')}</th>
              <th className="px-2 py-2">{renderTextFilter('observations', 'Observations')}</th>
              <th className="px-3 py-2 sticky right-0 z-30 bg-slate-50 border-l border-slate-200" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pagedEmployees.length === 0 ? (
              <tr>
                <td colSpan={39} className="px-6 py-16 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {totalCount === 0
                        ? 'No employee records yet'
                        : 'No employees match current filters'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {totalCount === 0
                        ? 'Add your first employee record, import a CSV file, or load sample data to begin.'
                        : 'Try clearing one or more column filters or your keyword search.'}
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-2">
                      {totalCount === 0 ? (
                        <button
                          type="button"
                          onClick={onAddEmployee}
                          className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add First Employee
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onResetFilters}
                          className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pagedEmployees.map((emp) => {
                const isSelected = selectedIds.has(emp.id);
                return (
                  <tr
                    key={emp.id}
                    className={`group transition-colors duration-100 ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'bg-white hover:bg-slate-50/90'
                    }`}
                  >
                    <td
                      className={`px-3 py-2 sticky left-0 z-10 ${
                        isSelected ? 'bg-blue-50/95' : 'bg-white group-hover:bg-slate-50/95'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => onToggleSelect(emp.id, e.shiftKey, pagedIds)}
                        onChange={() => {}}
                        aria-label={`Select ${emp.fullName}`}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer align-middle"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.staffNumber}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {emp.jobType ? (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${
                            emp.jobType === 'White'
                              ? 'bg-sky-50/70 text-sky-800 border-sky-200/80'
                              : 'bg-amber-50/70 text-amber-800 border-amber-200/80'
                          }`}
                        >
                          {emp.jobType}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <StatusCell status={emp.status} />
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onEditEmployee(emp)}
                        className="text-left hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                      >
                        {emp.fullName}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{emp.department}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{emp.gender}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.jobPosition}
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {emp.supervisor || <span className="text-slate-300">—</span>}
                    </td>

                    {/* Inline Contract Signed / Not signed dropdown */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={emp.contractSigned}
                        onChange={(e) =>
                          onInlineUpdateContract(emp, e.target.value as ContractSignedStatus)
                        }
                        aria-label={`Contract signed status for ${emp.fullName}`}
                        className={`px-2 py-1 text-xs font-semibold rounded border bg-white focus:outline-none focus:border-blue-500 cursor-pointer ${
                          emp.contractSigned === 'Signed'
                            ? 'text-emerald-700 border-emerald-200'
                            : 'text-red-600 border-red-200 bg-red-50/40'
                        }`}
                      >
                        <option value="Signed">Signed</option>
                        <option value="Not signed">Not signed</option>
                      </select>
                    </td>

                    {/* Inline NSSF Active Yes / No dropdown */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      <select
                        value={emp.enrolled}
                        onChange={(e) => onInlineUpdateEnrolled(emp, e.target.value as YesNo)}
                        aria-label={`NSSF active status for ${emp.fullName}`}
                        className={`px-2 py-1 text-xs font-medium rounded border bg-white focus:outline-none focus:border-blue-500 cursor-pointer ${
                          emp.enrolled === 'Yes'
                            ? 'text-slate-700 border-slate-200'
                            : 'text-amber-700 border-amber-200 bg-amber-50/40'
                        }`}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>

                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.entryDate || '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.probationEndDate || '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.contractEndDate || '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.nationality || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.nida || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.dateOfBirth || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.age || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.tin || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.nssfNumber || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.degree || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.phoneNumber || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.email || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.emergencyContact || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {emp.relationship || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.emergencyContactPhone || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.region || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.district || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.street || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.city || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-800 tabular-nums whitespace-nowrap text-right">
                      {emp.grossPay28x12 || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-800 tabular-nums whitespace-nowrap text-right">
                      {emp.grossPay30x8 || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-semibold text-slate-800 tabular-nums whitespace-nowrap text-right">
                      {emp.hourlySalary || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                      {emp.bankBranch || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {emp.swiftCode || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.sortCode || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                      {emp.account || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 max-w-[220px] truncate">
                      {emp.observations || <span className="text-slate-300">—</span>}
                    </td>

                    <td
                      className={`px-3 py-2 sticky right-0 z-10 border-l border-slate-100 text-right whitespace-nowrap ${
                        isSelected ? 'bg-blue-50/95' : 'bg-white group-hover:bg-slate-50/95'
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditEmployee(emp)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEmployee(emp)}
                          className="px-2.5 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3 tabular-nums">
          <span>
            Showing <strong className="font-semibold text-slate-900">{startIndex}</strong>–
            <strong className="font-semibold text-slate-900">{endIndex}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{employees.length}</strong> filtered
            {employees.length !== totalCount && ` (${totalCount} total)`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>All</option>
            </select>
          </label>

          {pageSize > 0 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => onPageChange(safePage - 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium tabular-nums">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => onPageChange(safePage + 1)}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
