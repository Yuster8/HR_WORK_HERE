import { ContractSignedStatus, Employee, EmployeeStatus, Gender, JobType, YesNo } from '../types/hr';
import {
  computeAgeFromDob,
  computeHourlySalary,
  extractDobFromNida,
  toSlashDate,
} from './autoCompute';

const CSV_HEADERS = [
  'Staff Number',
  'Job Type',
  'Status',
  'Full Name',
  'Department',
  'Gender',
  'Job Position',
  'Supervisor',
  'Contract Signed',
  'NSSF Active',
  'Entry Date',
  'End of Probation',
  'End of Contract',
  'Nationality',
  'NIDA',
  'Date of Birth',
  'Age',
  'TIN',
  'NSSF Number',
  'Degree',
  'Phone Number',
  'Email',
  'Emergency Contact',
  'Relationship',
  'Emergency Contact Phone Number',
  'Region',
  'District',
  'Street',
  'City',
  'Gross Pay (28*12)',
  'Gross Pay (30*8)',
  'Hourly Salary',
  'Bank Branch',
  'Swift Code',
  'Sort Code',
  'Account',
  'Observations',
];

function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportEmployeesToCsv(employees: Employee[], filename?: string): void {
  const rows = employees.map((emp) =>
    [
      emp.staffNumber,
      emp.jobType,
      emp.status,
      emp.fullName,
      emp.department,
      emp.gender,
      emp.jobPosition,
      emp.supervisor,
      emp.contractSigned,
      emp.enrolled,
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
      emp.grossPay28x12,
      emp.grossPay30x8,
      emp.hourlySalary,
      emp.bankBranch,
      emp.swiftCode,
      emp.sortCode,
      emp.account,
      emp.observations,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  const csvContent = [CSV_HEADERS.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = filename || `hr-workbench-employees-${dateStamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCsvMatrix(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const cleanText = text.replace(/^\uFEFF/, '');
  // Detect tab-separated paste vs comma-separated
  const firstLine = cleanText.split(/\r?\n/)[0] || '';
  const delimiter =
    firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const next = cleanText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(cell.trim());
        cell = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(cell.trim());
        if (row.some((c) => c !== '')) rows.push(row);
        row = [];
        cell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(cell.trim());
        if (row.some((c) => c !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c !== '')) {
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeJobType(val: string): JobType {
  const lower = val.toLowerCase();
  if (lower.includes('white')) return 'White';
  if (lower.includes('blue')) return 'Blue';
  return '';
}

function normalizeStatus(val: string): EmployeeStatus {
  const lower = val.toLowerCase();
  if (lower.includes('term')) return 'Terminated';
  if (lower.includes('prob')) return 'Probation';
  if (lower.includes('leave')) return 'On Leave';
  return 'Active';
}

function normalizeGender(val: string): Gender {
  const lower = val.toLowerCase();
  if (lower.startsWith('f')) return 'Female';
  if (lower.startsWith('m')) return 'Male';
  return 'Other';
}

function normalizeContractSigned(val: string): ContractSignedStatus {
  const lower = val.toLowerCase();
  if (['no', 'false', '0', 'not signed', 'unsigned', 'pending'].includes(lower) || lower.includes('not')) {
    return 'Not signed';
  }
  return 'Signed';
}

function normalizeYesNo(val: string): YesNo {
  return val.trim().toLowerCase() === 'no' ? 'No' : 'Yes';
}

export interface CsvParseResult {
  employees: Employee[];
  warnings: string[];
  detectedColumns: string[];
}

export function parseEmployeesCsv(text: string): CsvParseResult {
  const matrix = parseCsvMatrix(text);
  if (matrix.length < 2) {
    return {
      employees: [],
      warnings: ['File must contain a header row and at least one employee row.'],
      detectedColumns: [],
    };
  }

  const rawHeaders = matrix[0];
  const headerKeys = rawHeaders.map(normalizeHeader);
  const warnings: string[] = [];

  const findCol = (aliases: string[]): number => {
    for (const alias of aliases) {
      const idx = headerKeys.indexOf(alias);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colMap = {
    staffNumber: findCol(['staffnumber', 'staffno', 'empid', 'employeeid', 'id', 'staffid']),
    jobType: findCol(['jobtype', 'collar', 'type', 'category']),
    status: findCol(['status', 'employmentstatus', 'state']),
    fullName: findCol(['fullname', 'name', 'employeename']),
    department: findCol(['department', 'dept', 'division']),
    gender: findCol(['gender', 'sex']),
    jobPosition: findCol(['jobposition', 'position', 'title', 'role', 'jobtitle']),
    supervisor: findCol(['supervisor', 'manager', 'reportsto']),
    contractSigned: findCol(['contractsigned', 'contract', 'signed']),
    enrolled: findCol(['nssfactive', 'enrolled', 'socialinsurance', 'active']),
    entryDate: findCol(['entrydate', 'hiredate', 'employmentdate', 'startdate', 'datejoined']),
    probationEndDate: findCol(['endofprobation', 'probationenddate', 'probationend', 'probationdate']),
    contractEndDate: findCol(['endofcontract', 'contractenddate', 'contractexpirydate', 'contractexpiry', 'expirydate']),
    nationality: findCol(['nationality', 'country']),
    nida: findCol(['nida', 'nationalid', 'nidanumber']),
    dateOfBirth: findCol(['dateofbirth', 'dob', 'birthdate']),
    age: findCol(['age']),
    tin: findCol(['tin', 'taxid']),
    nssfNumber: findCol(['nssfnumber', 'nssf', 'socialsecurity']),
    degree: findCol(['degree', 'education', 'qualification']),
    phoneNumber: findCol(['phonenumber', 'phone', 'mobile']),
    email: findCol(['email', 'emailaddress']),
    emergencyContact: findCol(['emergencycontact', 'nextofkin']),
    relationship: findCol(['relationship', 'relation']),
    emergencyContactPhone: findCol(['emergencycontactphonenumber', 'emergencyphone', 'emergencycontactphone']),
    region: findCol(['region', 'province', 'state']),
    district: findCol(['district']),
    street: findCol(['street', 'address']),
    city: findCol(['city', 'town']),
    grossPay28x12: findCol(['grosspay2812', 'gross2812']),
    grossPay30x8: findCol(['grosspay308', 'gross308']),
    hourlySalary: findCol(['hourlysalary', 'hourlyrate']),
    bankBranch: findCol(['bankbranch', 'branch']),
    swiftCode: findCol(['swiftcode', 'swift']),
    sortCode: findCol(['sortcode', 'sort']),
    account: findCol(['account', 'accountnumber', 'bankaccount']),
    observations: findCol(['observations', 'notes', 'note', 'remarks']),
  };

  if (colMap.fullName === -1 && colMap.staffNumber === -1) {
    warnings.push('Could not detect "Staff Number" or "Full Name" columns. Check your CSV header row.');
    return { employees: [], warnings, detectedColumns: rawHeaders };
  }

  const parsed: Employee[] = [];
  const usedIds = new Set<string>();

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    const get = (idx: number) => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

    const staffNumber = get(colMap.staffNumber) || `IMP${1000 + i}`;
    const fullName = get(colMap.fullName) || `Employee ${staffNumber}`;
    if (!staffNumber && !fullName) continue;

    let uniqueId = `emp-${staffNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}-${i}`;
    while (usedIds.has(uniqueId)) {
      uniqueId += `-${Math.floor(Math.random() * 1000)}`;
    }
    usedIds.add(uniqueId);

    const nida = get(colMap.nida);
    const rawDob = get(colMap.dateOfBirth);
    const dateOfBirth = rawDob ? toSlashDate(rawDob) : extractDobFromNida(nida);
    const age = get(colMap.age) || computeAgeFromDob(dateOfBirth);
    const grossPay28x12 = get(colMap.grossPay28x12);
    const grossPay30x8 = get(colMap.grossPay30x8);
    const hourlySalary = get(colMap.hourlySalary) || computeHourlySalary(grossPay28x12, grossPay30x8);

    parsed.push({
      id: uniqueId,
      staffNumber,
      jobType: normalizeJobType(get(colMap.jobType)),
      status: normalizeStatus(get(colMap.status)),
      fullName: fullName.toUpperCase(),
      department: get(colMap.department) || 'General',
      gender: normalizeGender(get(colMap.gender)),
      jobPosition: get(colMap.jobPosition) || 'Staff',
      supervisor: get(colMap.supervisor),
      contractSigned: colMap.contractSigned !== -1 ? normalizeContractSigned(get(colMap.contractSigned)) : 'Signed',
      enrolled: colMap.enrolled !== -1 ? normalizeYesNo(get(colMap.enrolled)) : 'Yes',
      entryDate: toSlashDate(get(colMap.entryDate)) || toSlashDate(new Date().toISOString().slice(0, 10)),
      probationEndDate: toSlashDate(get(colMap.probationEndDate)),
      contractEndDate: toSlashDate(get(colMap.contractEndDate)),
      nationality: get(colMap.nationality),
      nida,
      dateOfBirth,
      age,
      tin: get(colMap.tin),
      nssfNumber: get(colMap.nssfNumber),
      degree: get(colMap.degree),
      phoneNumber: get(colMap.phoneNumber),
      email: get(colMap.email),
      emergencyContact: get(colMap.emergencyContact),
      relationship: get(colMap.relationship),
      emergencyContactPhone: get(colMap.emergencyContactPhone),
      region: get(colMap.region),
      district: get(colMap.district),
      street: get(colMap.street),
      city: get(colMap.city),
      grossPay28x12,
      grossPay30x8,
      hourlySalary,
      bankBranch: get(colMap.bankBranch),
      swiftCode: get(colMap.swiftCode),
      sortCode: get(colMap.sortCode),
      account: get(colMap.account),
      observations: get(colMap.observations),
    });
  }

  return {
    employees: parsed,
    warnings,
    detectedColumns: rawHeaders,
  };
}
