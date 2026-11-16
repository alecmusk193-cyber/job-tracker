import { motion } from 'framer-motion';
import { FileText, Mail, Wand2 } from 'lucide-react';
import CoverLetterTemplate from '../components/documents/CoverLetterTemplate';
import ResumeEditor from '../components/documents/ResumeEditor';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TABS = [
  { id: 'resume', label: 'Resumes', icon: FileText },
  { id: 'cover-letter', label: 'Cover letters', icon: Mail },
  { id: 'generator', label: 'Template generator', icon: Wand2 },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function Documents() {
  const [tab, setTab] = useLocalStorage<Tab>('docsTab', 'resume');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Documents</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Keep every resume & cover letter version in one place.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative inline-flex shrink-0 items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              tab === id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={16} /> {label}
            {tab === id && <motion.span layoutId="docs-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400" />}
          </button>
        ))}
      </div>

      {tab === 'resume' && <ResumeEditor key="resume" type="resume" />}
      {tab === 'cover-letter' && <ResumeEditor key="cover" type="cover-letter" />}
      {tab === 'generator' && <CoverLetterTemplate />}
    </div>
  );
}
