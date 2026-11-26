/**
 * Utilities for [AUTO] fields in HR Workbench:
 * - NIDA -> Date of Birth (YYYY/MM/DD) -> Age
 * - Gross Pay (28*12) / Gross Pay (30*8) -> Hourly Salary (¥...)
 * - Date formatting between YYYY/MM/DD and YYYY-MM-DD
 */

export function toIsoDate(slashOrIso: string): string {
  if (!slashOrIso) return '';
  const cleaned = slashOrIso.trim().replace(/\//g, '-');
  const m = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return '';
  const year = m[1];
  const month = m[2].padStart(2, '0');
  const day = m[3].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toSlashDate(isoOrSlash: string): string {
  if (!isoOrSlash) return '';
  const cleaned = isoOrSlash.trim().replace(/-/g, '/');
  const m = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return isoOrSlash.trim();
  return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}`;
}

export function computeAgeFromDob(dobStr: string, refYear = 2026, refMonth = 11, refDay = 26): string {
  const iso = toIsoDate(dobStr);
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || y < 1930 || y > refYear) return '';
  let age = refYear - y;
  if (refMonth < m || (refMonth === m && refDay < d)) {
    age -= 1;
  }
  return age >= 0 && age <= 100 ? String(age) : '';
}

export function extractDobFromNida(nida: string): string {
  const digits = nida.replace(/\D/g, '');
  if (digits.length < 8) return '';
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (year < 1940 || year > 2012) return '';
  if (month < 1 || month > 12) return '';
  if (day < 1 || day > 31) return '';
  const check = new Date(year, month - 1, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month - 1 ||
    check.getDate() !== day
  ) {
    return '';
  }
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

export function parseSalaryNumber(val: string): number {
  const num = Number(String(val || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

export function formatSalaryDisplay(val: string | number): string {
  const num = typeof val === 'number' ? val : parseSalaryNumber(val);
  if (!num) return '';
  return Math.round(num).toLocaleString('en-US');
}

export function computeHourlySalary(gross28x12: string, gross30x8: string): string {
  const g28 = parseSalaryNumber(gross28x12);
  const g30 = parseSalaryNumber(gross30x8);
  if (g28 > 0) {
    return `¥${(g28 / 452).toFixed(2)}`;
  }
  if (g30 > 0) {
    return `¥${(g30 / 304).toFixed(2)}`;
  }
  return '';
}

export function addDaysSlash(dateStr: string, days: number): string {
  const iso = toIsoDate(dateStr);
  const base = iso ? new Date(iso + 'T00:00:00') : new Date();
  if (Number.isNaN(base.getTime())) return toSlashDate(new Date().toISOString().slice(0, 10));
  base.setDate(base.getDate() + days);
  return toSlashDate(base.toISOString().slice(0, 10));
}

export function addMonthsSlash(dateStr: string, months: number): string {
  const iso = toIsoDate(dateStr);
  const base = iso ? new Date(iso + 'T00:00:00') : new Date();
  if (Number.isNaN(base.getTime())) return toSlashDate(new Date().toISOString().slice(0, 10));
  base.setMonth(base.getMonth() + months);
  return toSlashDate(base.toISOString().slice(0, 10));
}
