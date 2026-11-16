import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import clsx from 'clsx';
import type { Job, JobStatus } from '../../types';
import { JOB_STATUSES } from '../../types';
import { STATUS_STYLES } from '../../utils/status';
import JobCard from './JobCard';

interface Props {
  jobs: Job[];
  onMove: (id: string, status: JobStatus, beforeId?: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

/**
 * Drag & drop board with one column per status.
 * Dropping a card into another column changes its status; dropping inside a
 * column reorders it (order is persisted in the jobs array).
 */
export default function KanbanBoard({ jobs, onMove, onEdit, onDelete }: Props) {
  const columns = JOB_STATUSES.map((status) => ({ status, items: jobs.filter((j) => j.status === status) }));

  const handleDragEnd = ({ source, destination, draggableId }: DropResult) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const destStatus = destination.droppableId as JobStatus;
    const others = jobs.filter((j) => j.id !== draggableId);
    // Cards currently in the destination column, without the dragged one
    const destItems = others.filter((j) => j.status === destStatus);
    let beforeId = destItems[destination.index]?.id;
    // Dropped at the end of a non-empty column → insert right after its last card
    if (!beforeId && destItems.length) {
      beforeId = others[others.indexOf(destItems[destItems.length - 1]) + 1]?.id;
    }
    onMove(draggableId, destStatus, beforeId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="scrollbar-thin -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {columns.map(({ status, items }) => (
          <div
            key={status}
            className={clsx(
              'flex w-72 shrink-0 snap-start flex-col rounded-2xl border-t-4 bg-slate-100/80 dark:bg-slate-900',
              STATUS_STYLES[status].column,
            )}
          >
            <div className="flex items-center justify-between px-3.5 py-3">
              <h3 className="text-sm font-semibold">{status}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {items.length}
              </span>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={clsx(
                    'min-h-[120px] flex-1 space-y-3 rounded-b-2xl px-2.5 pb-3 transition-colors',
                    snapshot.isDraggingOver && 'bg-brand-50 dark:bg-brand-500/5',
                  )}
                >
                  {items.map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id} index={index}>
                      {(drag, dragSnapshot) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                          <JobCard job={job} onEdit={onEdit} onDelete={onDelete} dragging={dragSnapshot.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {items.length === 0 && !snapshot.isDraggingOver && (
                    <p className="py-6 text-center text-xs text-slate-400">Drop here</p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
