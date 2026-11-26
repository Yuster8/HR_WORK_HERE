import { Employee, HRAlert } from '../types/hr';
import { toIsoDate } from './autoCompute';

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00');
  const to = new Date(toIso + 'T00:00:00');
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 9999;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeHRAlerts(employees: Employee[], referenceDateIso?: string): HRAlert[] {
  const todayIso = referenceDateIso || new Date().toISOString().slice(0, 10);
  const alerts: HRAlert[] = [];

  for (const emp of employees) {
    if (emp.status === 'Terminated') continue;

    // 1. Unsigned Contract
    if (emp.contractSigned === 'Not signed') {
      alerts.push({
        id: `alert-unsigned-${emp.id}`,
        employeeId: emp.id,
        staffNumber: emp.staffNumber,
        fullName: emp.fullName,
        department: emp.department,
        jobPosition: emp.jobPosition,
        status: emp.status,
        type: 'unsigned_contract',
        severity: 'critical',
        title: 'Contract Not Signed',
        detail: 'Employment agreement is awaiting signature.',
        dueDate: emp.entryDate || todayIso.replace(/-/g, '/'),
        daysDelta: emp.entryDate ? daysBetween(todayIso, toIsoDate(emp.entryDate)) : 0,
      });
    }

    // 2. End of Probation checks (for non-terminated staff with a probation end date near/past)
    const probIso = toIsoDate(emp.probationEndDate);
    if (probIso) {
      const delta = daysBetween(todayIso, probIso);
      if (emp.status === 'Probation' && delta < 0) {
        alerts.push({
          id: `alert-prob-overdue-${emp.id}`,
          employeeId: emp.id,
          staffNumber: emp.staffNumber,
          fullName: emp.fullName,
          department: emp.department,
          jobPosition: emp.jobPosition,
          status: emp.status,
          type: 'probation_overdue',
          severity: 'critical',
          title: 'Probation Review Overdue',
          detail: `End of probation was ${Math.abs(delta)} day${Math.abs(delta) === 1 ? '' : 's'} ago (${emp.probationEndDate}).`,
          dueDate: emp.probationEndDate,
          daysDelta: delta,
        });
      } else if (delta >= 0 && delta <= 30) {
        alerts.push({
          id: `alert-prob-upcoming-${emp.id}`,
          employeeId: emp.id,
          staffNumber: emp.staffNumber,
          fullName: emp.fullName,
          department: emp.department,
          jobPosition: emp.jobPosition,
          status: emp.status,
          type: 'probation_upcoming',
          severity: 'warning',
          title: 'Probation Ending Soon',
          detail: `Probation ends in ${delta} day${delta === 1 ? '' : 's'} (${emp.probationEndDate}).`,
          dueDate: emp.probationEndDate,
          daysDelta: delta,
        });
      }
    }

    // 3. End of Contract checks
    const contractEndIso = toIsoDate(emp.contractEndDate);
    if (contractEndIso) {
      const delta = daysBetween(todayIso, contractEndIso);
      if (delta < 0) {
        alerts.push({
          id: `alert-exp-past-${emp.id}`,
          employeeId: emp.id,
          staffNumber: emp.staffNumber,
          fullName: emp.fullName,
          department: emp.department,
          jobPosition: emp.jobPosition,
          status: emp.status,
          type: 'contract_expired',
          severity: 'critical',
          title: 'Contract Expired',
          detail: `End of contract passed ${Math.abs(delta)} day${Math.abs(delta) === 1 ? '' : 's'} ago (${emp.contractEndDate}).`,
          dueDate: emp.contractEndDate,
          daysDelta: delta,
        });
      } else if (delta <= 45) {
        alerts.push({
          id: `alert-exp-soon-${emp.id}`,
          employeeId: emp.id,
          staffNumber: emp.staffNumber,
          fullName: emp.fullName,
          department: emp.department,
          jobPosition: emp.jobPosition,
          status: emp.status,
          type: 'contract_expiring',
          severity: 'warning',
          title: 'Contract Expiring Soon',
          detail: `Contract ends in ${delta} day${delta === 1 ? '' : 's'} (${emp.contractEndDate}).`,
          dueDate: emp.contractEndDate,
          daysDelta: delta,
        });
      }
    }
  }

  return alerts.sort((a, b) => {
    const sevRank = { critical: 0, warning: 1, info: 2 };
    if (sevRank[a.severity] !== sevRank[b.severity]) {
      return sevRank[a.severity] - sevRank[b.severity];
    }
    return a.daysDelta - b.daysDelta;
  });
}
