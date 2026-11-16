import type { Job } from '../types';

/**
 * Replace {{placeholders}} in a cover-letter template with values from a job
 * and the user's profile. Unknown / empty placeholders are left visible so
 * the user notices them.
 */
export function fillTemplate(template: string, job: Job | undefined, profile: { name: string; email: string }): string {
  const values: Record<string, string | undefined> = {
    company: job?.company,
    position: job?.position,
    recruiter: job?.contact.name || 'Hiring Manager',
    location: job ? (job.city ? `${job.city} (${job.location})` : job.location) : undefined,
    myName: profile.name,
    myEmail: profile.email,
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
  };
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => values[key] || match);
}
