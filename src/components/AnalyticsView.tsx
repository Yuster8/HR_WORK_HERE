import React, { useMemo } from 'react';
import { Employee } from '../types/hr';

interface AnalyticsViewProps {
  employees: Employee[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ employees }) => {
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const probation = employees.filter((e) => e.status === 'Probation').length;
    const onLeave = employees.filter((e) => e.status === 'On Leave').length;
    const terminated = employees.filter((e) => e.status === 'Terminated').length;

    const blue = employees.filter((e) => e.jobType === 'Blue').length;
    const white = employees.filter((e) => e.jobType === 'White').length;

    const female = employees.filter((e) => e.gender === 'Female').length;
    const male = employees.filter((e) => e.gender === 'Male').length;
    const other = employees.filter((e) => e.gender === 'Other').length;

    const activePool = employees.filter((e) => e.status !== 'Terminated');
    const signedCount = activePool.filter((e) => e.contractSigned === 'Signed').length;
    const complianceRate =
      activePool.length > 0 ? Math.round((signedCount / activePool.length) * 100) : 100;

    const deptMap = new Map<
      string,
      { total: number; active: number; blue: number; white: number; unsigned: number }
    >();
    for (const e of employees) {
      const curr = deptMap.get(e.department) || {
        total: 0,
        active: 0,
        blue: 0,
        white: 0,
        unsigned: 0,
      };
      curr.total += 1;
      if (e.status === 'Active' || e.status === 'Probation') curr.active += 1;
      if (e.jobType === 'Blue') curr.blue += 1;
      else if (e.jobType === 'White') curr.white += 1;
      if (e.contractSigned === 'Not signed' && e.status !== 'Terminated') curr.unsigned += 1;
      deptMap.set(e.department, curr);
    }

    const departments = Array.from(deptMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    return {
      total,
      active,
      probation,
      onLeave,
      terminated,
      blue,
      white,
      female,
      male,
      other,
      complianceRate,
      signedCount,
      activePoolCount: activePool.length,
      departments,
    };
  }, [employees]);

  const maxDeptTotal = Math.max(1, ...stats.departments.map((d) => d.total));

  return (
    <div className="space-y-6">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{stats.active}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Active Headcount
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.probation} on probation · {stats.onLeave} on leave
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {stats.complianceRate}%
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Contract Compliance
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.signedCount} of {stats.activePoolCount} non-terminated signed
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total > 0 ? Math.round((stats.blue / stats.total) * 100) : 0}% /{' '}
            {stats.total > 0 ? Math.round((stats.white / stats.total) * 100) : 0}%
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Blue vs White Collar
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.blue} Blue · {stats.white} White
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total > 0 ? Math.round((stats.terminated / stats.total) * 100) : 0}%
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Terminated Share
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {stats.terminated} separated records
          </div>
        </div>
      </div>

      {/* Department Headcount & Gender Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Headcount by Department</h3>
              <p className="text-xs text-slate-500">
                Distribution across Blue and White collar workforce
              </p>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {stats.departments.length} departments
            </span>
          </div>

          <div className="space-y-3">
            {stats.departments.map((dept) => {
              const bluePct = (dept.blue / maxDeptTotal) * 100;
              const whitePct = (dept.white / maxDeptTotal) * 100;
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="text-slate-600 tabular-nums">
                      <strong className="text-slate-900">{dept.total}</strong> total · {dept.blue}{' '}
                      Blue / {dept.white} White
                      {dept.unsigned > 0 && (
                        <span className="text-red-600 font-medium">
                          {' '}
                          · {dept.unsigned} unsigned
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded overflow-hidden flex">
                    <div
                      style={{ width: `${bluePct}%` }}
                      className="bg-amber-500 h-full"
                      title={`Blue Collar: ${dept.blue}`}
                    />
                    <div
                      style={{ width: `${whitePct}%` }}
                      className="bg-blue-600 h-full"
                      title={`White Collar: ${dept.white}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender & Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Workforce Composition</h3>
            <p className="text-xs text-slate-500">Gender and employment status totals</p>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              By Gender
            </div>
            {[
              { label: 'Male', count: stats.male, color: 'bg-slate-800' },
              { label: 'Female', count: stats.female, color: 'bg-blue-600' },
              { label: 'Other', count: stats.other, color: 'bg-slate-400' },
            ].map((row) => {
              const pct = stats.total > 0 ? Math.round((row.count / stats.total) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{row.label}</span>
                    <span className="tabular-nums text-slate-600">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden">
                    <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              By Employment Status
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { label: 'Active', count: stats.active, cls: 'text-emerald-700' },
                { label: 'Probation', count: stats.probation, cls: 'text-amber-700' },
                { label: 'On Leave', count: stats.onLeave, cls: 'text-blue-700' },
                { label: 'Terminated', count: stats.terminated, cls: 'text-red-700' },
              ].map((st) => (
                <div key={st.label} className="py-2 flex items-center justify-between">
                  <span className={`font-semibold ${st.cls}`}>{st.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
