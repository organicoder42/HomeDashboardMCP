'use client';

import { useState, useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { DashboardEntry } from '@/db/schema';
import TaskCard from './task-card';

interface TimelineViewProps {
  entries: DashboardEntry[];
}

function SortableTaskCard({ entry }: { entry: DashboardEntry }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard entry={entry} isDragging={isDragging} />
    </div>
  );
}

export default function TimelineView({ entries }: TimelineViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  // Sort entries by order, then by createdAt
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [entries]);

  // Group entries by time of day
  const groupedEntries = useMemo(() => {
    const groups = {
      completed: [] as DashboardEntry[],
      morning: [] as DashboardEntry[],
      afternoon: [] as DashboardEntry[],
      evening: [] as DashboardEntry[],
      unscheduled: [] as DashboardEntry[],
    };

    sortedEntries.forEach((entry) => {
      if (entry.status === 'completed') {
        groups.completed.push(entry);
        return;
      }

      if (entry.startTime) {
        const hour = new Date(entry.startTime).getHours();
        if (hour < 12) {
          groups.morning.push(entry);
        } else if (hour < 17) {
          groups.afternoon.push(entry);
        } else {
          groups.evening.push(entry);
        }
      } else {
        groups.unscheduled.push(entry);
      }
    });

    return groups;
  }, [sortedEntries]);

  const activeEntry = sortedEntries.find((entry) => entry.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // In a real implementation, update the order via MCP
      console.log('Reorder:', active.id, 'to', over.id);
      // TODO: Call MCP reorder_tasks tool
    }

    setActiveId(null);
  }

  const TimeSection = ({
    title,
    icon: Icon,
    entries,
    emoji
  }: {
    title: string;
    icon: any;
    entries: DashboardEntry[];
    emoji: string;
  }) => {
    if (entries.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-2xl">{emoji}</span>
            <Icon size={20} strokeWidth={2.5} />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
          <span className="text-sm text-gray-500 font-medium">
            {entries.length} {entries.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <SortableTaskCard key={entry.id} entry={entry} />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedEntries.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {/* Active/In Progress section always on top */}
          {groupedEntries.unscheduled.filter(e => e.status === 'in_progress').length > 0 && (
            <TimeSection
              title="In Progress"
              icon={LucideIcons.PlayCircle}
              emoji="▶️"
              entries={groupedEntries.unscheduled.filter(e => e.status === 'in_progress')}
            />
          )}

          {/* Morning tasks */}
          <TimeSection
            title="Morning"
            icon={LucideIcons.Sunrise}
            emoji="☀️"
            entries={groupedEntries.morning}
          />

          {/* Afternoon tasks */}
          <TimeSection
            title="Afternoon"
            icon={LucideIcons.Sun}
            emoji="🌤️"
            entries={groupedEntries.afternoon}
          />

          {/* Evening tasks */}
          <TimeSection
            title="Evening"
            icon={LucideIcons.Moon}
            emoji="🌙"
            entries={groupedEntries.evening}
          />

          {/* Unscheduled tasks */}
          <TimeSection
            title="Unscheduled"
            icon={LucideIcons.Calendar}
            emoji="📋"
            entries={groupedEntries.unscheduled.filter(e => e.status !== 'in_progress')}
          />

          {/* Completed tasks */}
          {groupedEntries.completed.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 pt-8 border-t-2 border-dashed border-gray-300"
            >
              <TimeSection
                title="Completed"
                icon={LucideIcons.CheckCircle2}
                emoji="✓"
                entries={groupedEntries.completed}
              />
            </motion.div>
          )}
        </div>
      </SortableContext>

      {/* Drag overlay */}
      <DragOverlay>
        {activeEntry ? (
          <div className="opacity-80 rotate-3 scale-105">
            <TaskCard entry={activeEntry} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
