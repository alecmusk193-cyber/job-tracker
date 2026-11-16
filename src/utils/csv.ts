import type { Job } from '../types';

/** Escape a value for CSV: wrap in quotes and double any inner quotes. */
function escape(value: unknown): string {
  const s = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Convert jobs to a CSV string (Excel-friendly, with BOM for UTF-8). */
export function jobsToCSV(jobs: Job[]): string {
  const headers = [
    'Company',
    'Position',
    'Location',
    'City',
    'Status',
    'Date Applied',
    'Deadline',
    'Interview Date',
    'Salary Min',
    'Salary Max',
    'Job URL',
    'Tags',
    'Recruiter',
    'Recruiter Email',
    'Notes',
  ];
  const rows = jobs.map((j) =>
    [
      j.company,
      j.position,
      j.location,
      j.city,
      j.status,
      j.dateApplied,
      j.deadline,
      j.interviewDate,
      j.salaryMin,
      j.salaryMax,
      j.url,
      j.tags.join('; '),
      j.contact.name,
      j.contact.email,
      j.notes,
    ]
      .map(escape)
      .join(','),
  );
  return '﻿' + [headers.join(','), ...rows].join('\r\n');
}

/** Trigger a browser download for in-memory content. */
export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
