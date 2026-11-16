import type { JobStatus } from '../../types';
import { STATUS_STYLES } from '../../utils/status';

/** Colour-coded pill for a job status. */
export default function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`badge ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
