import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import {
  ContractSignedStatus,
  Employee,
  EmployeeStatus,
  Gender,
  JobType,
  YesNo,
} from '../types/hr';
import {
  addMonthsSlash,
  computeAgeFromDob,
  computeHourlySalary,
  extractDobFromNida,
  toIsoDate,
  toSlashDate,
} from '../utils/autoCompute';

interface EmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  existingStaffNumbers: Set<string>;
  departments: string[];
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>, existingId?: string) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  employee,
  existingStaffNumbers,
  departments,
  onClose,
  onSave,
}) => {
  const todaySlash = toSlashDate(new Date().toISOString().slice(0, 10));

  const [staffNumber, setStaffNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobType, setJobType] = useState<JobType>('Blue');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [department, setDepartment] = useState('Warehouse');
  const [gender, setGender] = useState<Gender>('Male');
  const [jobPosition, setJobPosition] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [contractSigned, setContractSigned] = useState<ContractSignedStatus>('Signed');
  const [enrolled, setEnrolled] = useState<YesNo>('Yes');
  const [entryDate, setEntryDate] = useState(todaySlash);
  const [probationEndDate, setProbationEndDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');

  const [nationality, setNationality] = useState('Tanzanian');
  const [nida, setNida] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [tin, setTin] = useState('');
  const [nssfNumber, setNssfNumber] = useState('');
  const [degree, setDegree] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [relationship, setRelationship] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');

  const [grossPay28x12, setGrossPay28x12] = useState('');
  const [grossPay30x8, setGrossPay30x8] = useState('');
  const [hourlySalary, setHourlySalary] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [swiftCode, setSwiftCode] = useState('CORUTZTZ');
  const [sortCode, setSortCode] = useState('');
  const [account, setAccount] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (employee) {
      setStaffNumber(employee.staffNumber);
      setFullName(employee.fullName);
      setJobType(employee.jobType);
      setStatus(employee.status);
      setDepartment(employee.department);
      setGender(employee.gender);
      setJobPosition(employee.jobPosition);
      setSupervisor(employee.supervisor);
      setContractSigned(employee.contractSigned);
      setEnrolled(employee.enrolled);
      setEntryDate(employee.entryDate);
      setProbationEndDate(employee.probationEndDate);
      setContractEndDate(employee.contractEndDate);
      setNationality(employee.nationality);
      setNida(employee.nida);
      setDateOfBirth(employee.dateOfBirth);
      setAge(employee.age);
      setTin(employee.tin);
      setNssfNumber(employee.nssfNumber);
      setDegree(employee.degree);
      setPhoneNumber(employee.phoneNumber);
      setEmail(employee.email);
      setEmergencyContact(employee.emergencyContact);
      setRelationship(employee.relationship);
      setEmergencyContactPhone(employee.emergencyContactPhone);
      setRegion(employee.region);
      setDistrict(employee.district);
      setStreet(employee.street);
      setCity(employee.city);
      setGrossPay28x12(employee.grossPay28x12);
      setGrossPay30x8(employee.grossPay30x8);
      setHourlySalary(employee.hourlySalary);
      setBankBranch(employee.bankBranch);
      setSwiftCode(employee.swiftCode);
      setSortCode(employee.sortCode);
      setAccount(employee.account);
      setObservations(employee.observations);
    } else {
      let nextNum = 174;
      while (existingStaffNumbers.has(`EMP${nextNum}`)) {
        nextNum++;
      }
      setStaffNumber(`EMP${nextNum}`);
      setFullName('');
      setJobType('Blue');
      setStatus('Active');
      setDepartment(departments[0] || 'Warehouse');
      setGender('Male');
      setJobPosition('');
      setSupervisor('');
      setContractSigned('Not signed');
      setEnrolled('Yes');
      setEntryDate(todaySlash);
      setProbationEndDate(addMonthsSlash(todaySlash, 3));
      setContractEndDate(addMonthsSlash(todaySlash, 12));
      setNationality('Tanzanian');
      setNida('');
      setDateOfBirth('');
      setAge('');
      setTin('');
      setNssfNumber('');
      setDegree('');
      setPhoneNumber('');
      setEmail('');
      setEmergencyContact('');
      setRelationship('');
      setEmergencyContactPhone('');
      setRegion('');
      setDistrict('');
      setStreet('');
      setCity('');
      setGrossPay28x12('');
      setGrossPay30x8('');
      setHourlySalary('');
      setBankBranch('');
      setSwiftCode('CORUTZTZ');
      setSortCode('');
      setAccount('');
      setObservations('');
    }
  }, [isOpen, employee, existingStaffNumbers, departments, todaySlash]);

  if (!isOpen) return null;

  const handleNidaChange = (val: string) => {
    setNida(val);
    const autoDob = extractDobFromNida(val);
    if (autoDob) {
      setDateOfBirth(autoDob);
      const autoAge = computeAgeFromDob(autoDob);
      if (autoAge) setAge(autoAge);
    }
  };

  const handleDobChange = (val: string) => {
    const formatted = val.includes('-') ? toSlashDate(val) : val;
    setDateOfBirth(formatted);
    const autoAge = computeAgeFromDob(formatted);
    if (autoAge) setAge(autoAge);
  };

  const handleGross28Change = (val: string) => {
    setGrossPay28x12(val);
    const hourly = computeHourlySalary(val, grossPay30x8);
    if (hourly) setHourlySalary(hourly);
  };

  const handleGross30Change = (val: string) => {
    setGrossPay30x8(val);
    const hourly = computeHourlySalary(grossPay28x12, val);
    if (hourly) setHourlySalary(hourly);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedStaff = staffNumber.trim().toUpperCase();
    const trimmedName = fullName.trim().toUpperCase();
    const trimmedDept = department.trim();
    const trimmedPos = jobPosition.trim();

    if (!trimmedStaff) {
      setError('Staff Number is required.');
      return;
    }
    if (!trimmedName) {
      setError('Full Name is required.');
      return;
    }
    if (!trimmedDept) {
      setError('Department is required.');
      return;
    }
    if (!trimmedPos) {
      setError('Job Position is required.');
      return;
    }
    if (
      (!employee || employee.staffNumber.toUpperCase() !== trimmedStaff) &&
      existingStaffNumbers.has(trimmedStaff)
    ) {
      setError(`Staff Number ${trimmedStaff} already exists.`);
      return;
    }

    onSave(
      {
        staffNumber: trimmedStaff,
        fullName: trimmedName,
        jobType,
        status,
        department: trimmedDept,
        gender,
        jobPosition: trimmedPos,
        supervisor: supervisor.trim().toUpperCase(),
        contractSigned,
        enrolled,
        entryDate: toSlashDate(entryDate),
        probationEndDate: toSlashDate(probationEndDate),
        contractEndDate: toSlashDate(contractEndDate),
        nationality: nationality.trim(),
        nida: nida.trim(),
        dateOfBirth: toSlashDate(dateOfBirth),
        age: age.trim(),
        tin: tin.trim(),
        nssfNumber: nssfNumber.trim(),
        degree: degree.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        emergencyContact: emergencyContact.trim().toUpperCase(),
        relationship: relationship.trim().toUpperCase(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        region: region.trim().toUpperCase(),
        district: district.trim().toUpperCase(),
        street: street.trim().toUpperCase(),
        city: city.trim(),
        grossPay28x12: grossPay28x12.trim(),
        grossPay30x8: grossPay30x8.trim(),
        hourlySalary: hourlySalary.trim(),
        bankBranch: bankBranch.trim(),
        swiftCode: swiftCode.trim().toUpperCase(),
        sortCode: sortCode.trim(),
        account: account.trim(),
        observations: observations.trim(),
      },
      employee?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="employee-modal-title" className="text-base font-bold text-slate-900">
              {employee ? `Edit Employee · ${employee.staffNumber}` : 'Add New Employee'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              NIDA automatically extracts Date of Birth &amp; Age. Gross Pay automatically calculates Hourly Salary.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Core Employment & Contract */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Employment &amp; Contract Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Number *
                </label>
                <input
                  type="text"
                  value={staffNumber}
                  onChange={(e) => setStaffNumber(e.target.value)}
                  placeholder="EMP174"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="FULL NAME"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Blue">Blue</option>
                  <option value="White">White</option>
                  <option value="">Unspecified</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Probation">Probation</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  list="hr-department-options"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <datalist id="hr-department-options">
                  {departments.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Position *
                </label>
                <input
                  type="text"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="e.g. Forklift Operator"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supervisor
                </label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Supervisor name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contract Signed
                </label>
                <select
                  value={contractSigned}
                  onChange={(e) => setContractSigned(e.target.value as ContractSignedStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Signed">Signed</option>
                  <option value="Not signed">Not signed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NSSF Active
                </label>
                <select
                  value={enrolled}
                  onChange={(e) => setEnrolled(e.target.value as YesNo)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entry Date
                </label>
                <input
                  type="date"
                  value={toIsoDate(entryDate)}
                  onChange={(e) => setEntryDate(toSlashDate(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End of Probation
                </label>
                <input
                  type="date"
                  value={toIsoDate(probationEndDate)}
                  onChange={(e) => setProbationEndDate(toSlashDate(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End of Contract
                </label>
                <input
                  type="date"
                  value={toIsoDate(contractEndDate)}
                  onChange={(e) => setContractEndDate(toSlashDate(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identity, NIDA Auto-DOB/Age & Education */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Identity, Statutory IDs &amp; Education
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIDA <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                </label>
                <input
                  type="text"
                  value={nida}
                  onChange={(e) => handleNidaChange(e.target.value)}
                  placeholder="20-digit NIDA (auto-fills DOB & Age)"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DOB <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                  </label>
                  <input
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => handleDobChange(e.target.value)}
                    placeholder="YYYY/MM/DD"
                    className="w-full px-2.5 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                  </label>
                  <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TIN</label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NSSF Number
                </label>
                <input
                  type="text"
                  value={nssfNumber}
                  onChange={(e) => setNssfNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="Bachelor / Diploma / Certificate / Form Four"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact, Emergency & Address */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Contact, Emergency Contact &amp; Residence
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="FATHER / MOTHER / WIFE / SISTER"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payroll, Banking & Observations */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1.5">
              Payroll &amp; Banking Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gross Pay (28*12) <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                </label>
                <input
                  type="text"
                  value={grossPay28x12}
                  onChange={(e) => handleGross28Change(e.target.value)}
                  placeholder="e.g. 500,000"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gross Pay (30*8) <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                </label>
                <input
                  type="text"
                  value={grossPay30x8}
                  onChange={(e) => handleGross30Change(e.target.value)}
                  placeholder="e.g. 1,600,000"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hourly Salary <span className="text-[10px] text-blue-600 font-bold">AUTO</span>
                </label>
                <input
                  type="text"
                  value={hourlySalary}
                  onChange={(e) => setHourlySalary(e.target.value)}
                  placeholder="¥1106.19"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Branch
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Swift Code
                </label>
                <input
                  type="text"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sort Code</label>
                <input
                  type="text"
                  value={sortCode}
                  onChange={(e) => setSortCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account</label>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observations
              </label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Additional HR notes or observations..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              {employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
