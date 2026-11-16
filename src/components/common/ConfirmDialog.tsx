import Modal from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Small "are you sure?" dialog for destructive actions. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="md">
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
