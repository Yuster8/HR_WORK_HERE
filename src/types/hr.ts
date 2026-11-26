export type JobType = 'White' | 'Blue' | '';
export type EmployeeStatus = 'Active' | 'Probation' | 'On Leave' | 'Terminated';
export type Gender = 'Female' | 'Male' | 'Other';
export type ContractSignedStatus = 'Signed' | 'Not signed';
export type YesNo = 'Yes' | 'No';
export type ActiveView = 'records' | 'alerts' | 'analytics' | 'history';

export interface Employee {
  id: string;
  staffNumber: string;
  jobType: JobType;
  status: EmployeeStatus;
  fullName: string;
  department: string;
  gender: Gender;
  jobPosition: string;
  supervisor: string;
  contractSigned: ContractSignedStatus;
  enrolled: YesNo;
  entryDate: string;
  probationEndDate: string;
  contractEndDate: string;
  nationality: string;
  nida: string;
  dateOfBirth: string;
  age: string;
  tin: string;
  nssfNumber: string;
  degree: string;
  phoneNumber: string;
  email: string;
  emergencyContact: string;
  relationship: string;
  emergencyContactPhone: string;
  region: string;
  district: string;
  street: string;
  city: string;
  grossPay28x12: string;
  grossPay30x8: string;
  hourlySalary: string;
  bankBranch: string;
  swiftCode: string;
  sortCode: string;
  account: string;
  observations: string;
}

export interface ColumnFilters {
  keyword: string;
  staffNumber: string;
  jobType: 'All' | 'White' | 'Blue';
  status: 'All' | EmployeeStatus;
  fullName: string;
  department: string;
  gender: 'All' | Gender;
  jobPosition: string;
  supervisor: string;
  contractSigned: 'All' | ContractSignedStatus;
  enrolled: 'All' | YesNo;
  entryDate: string;
  probationEndDate: string;
  contractEndDate: string;
  nationality: string;
  nida: string;
  dateOfBirth: string;
  age: string;
  tin: string;
  nssfNumber: string;
  degree: string;
  phoneNumber: string;
  email: string;
  emergencyContact: string;
  relationship: string;
  emergencyContactPhone: string;
  region: string;
  district: string;
  street: string;
  city: string;
  grossPay28x12: string;
  grossPay30x8: string;
  hourlySalary: string;
  bankBranch: string;
  swiftCode: string;
  sortCode: string;
  account: string;
  observations: string;
}

export type SortField =
  | 'staffNumber'
  | 'jobType'
  | 'status'
  | 'fullName'
  | 'department'
  | 'gender'
  | 'jobPosition'
  | 'supervisor'
  | 'contractSigned'
  | 'enrolled'
  | 'entryDate'
  | 'probationEndDate'
  | 'contractEndDate'
  | 'nationality'
  | 'age'
  | 'region'
  | 'city';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export type AlertType =
  | 'unsigned_contract'
  | 'probation_overdue'
  | 'probation_upcoming'
  | 'contract_expired'
  | 'contract_expiring';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface HRAlert {
  id: string;
  employeeId: string;
  staffNumber: string;
  fullName: string;
  department: string;
  jobPosition: string;
  status: EmployeeStatus;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  detail: string;
  dueDate: string;
  daysDelta: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  label: string;
  actionType:
    | 'add'
    | 'edit'
    | 'delete'
    | 'bulk_delete'
    | 'bulk_update'
    | 'import'
    | 'reset'
    | 'alert_action'
    | 'init';
  affectedCount: number;
  snapshot: Employee[];
}
