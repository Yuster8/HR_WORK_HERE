import { useCallback, useEffect, useState } from 'react';
import { createSampleEmployees } from '../data/sampleEmployees';
import { Employee, HistoryRecord } from '../types/hr';

const STORAGE_KEY = 'hr_workbench_employees_v2';
const MAX_HISTORY_STEPS = 80;

function loadInitialEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to sample dataset if storage is unavailable or corrupted
  }
  return createSampleEmployees();
}

export interface HistoryState {
  timeline: HistoryRecord[];
  pointer: number;
}

export function useEmployeeHistory() {
  const [state, setState] = useState<HistoryState>(() => {
    const initial = loadInitialEmployees();
    return {
      timeline: [
        {
          id: 'hist-init',
          timestamp: new Date().toISOString(),
          label: `Session loaded (${initial.length} employees)`,
          actionType: 'init',
          affectedCount: initial.length,
          snapshot: initial,
        },
      ],
      pointer: 0,
    };
  });

  const [lastFeedback, setLastFeedback] = useState<{
    id: number;
    message: string;
    canQuickRedo?: boolean;
    canQuickUndo?: boolean;
  } | null>(null);

  const employees = state.timeline[state.pointer]?.snapshot ?? [];
  const canUndo = state.pointer > 0;
  const canRedo = state.pointer < state.timeline.length - 1;

  const undoLabel = canUndo ? state.timeline[state.pointer].label : '';
  const redoLabel = canRedo ? state.timeline[state.pointer + 1].label : '';

  // Persist current employee list to localStorage on every pointer/state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [employees]);

  const commitChange = useCallback(
    (
      updater: Employee[] | ((prev: Employee[]) => Employee[]),
      label: string,
      actionType: HistoryRecord['actionType'],
      affectedCount: number,
      showFeedback = true
    ) => {
      setState((prev) => {
        const current = prev.timeline[prev.pointer]?.snapshot ?? [];
        const nextSnapshot = typeof updater === 'function' ? updater(current) : updater;

        const sliced = prev.timeline.slice(0, prev.pointer + 1);
        const newEntry: HistoryRecord = {
          id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          label,
          actionType,
          affectedCount,
          snapshot: nextSnapshot,
        };

        const combined = [...sliced, newEntry];
        const trimmed =
          combined.length > MAX_HISTORY_STEPS
            ? combined.slice(combined.length - MAX_HISTORY_STEPS)
            : combined;

        return {
          timeline: trimmed,
          pointer: trimmed.length - 1,
        };
      });

      if (showFeedback) {
        setLastFeedback({
          id: Date.now(),
          message: label,
          canQuickUndo: true,
        });
      }
    },
    []
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.pointer <= 0) return prev;
      const undoneEntry = prev.timeline[prev.pointer];
      setLastFeedback({
        id: Date.now(),
        message: `Undid: ${undoneEntry.label}`,
        canQuickRedo: true,
      });
      return {
        ...prev,
        pointer: prev.pointer - 1,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.pointer >= prev.timeline.length - 1) return prev;
      const redoneEntry = prev.timeline[prev.pointer + 1];
      setLastFeedback({
        id: Date.now(),
        message: `Redid: ${redoneEntry.label}`,
        canQuickUndo: true,
      });
      return {
        ...prev,
        pointer: prev.pointer + 1,
      };
    });
  }, []);

  const jumpTo = useCallback((index: number) => {
    setState((prev) => {
      if (index < 0 || index >= prev.timeline.length || index === prev.pointer) return prev;
      const target = prev.timeline[index];
      setLastFeedback({
        id: Date.now(),
        message: `Restored state: ${target.label}`,
      });
      return {
        ...prev,
        pointer: index,
      };
    });
  }, []);

  const dismissFeedback = useCallback(() => {
    setLastFeedback(null);
  }, []);

  // Global keyboard shortcuts for Ctrl+Z / Cmd+Z (Undo) and Ctrl+Y / Cmd+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Auto-hide feedback toast after 5 seconds
  useEffect(() => {
    if (!lastFeedback) return;
    const timer = window.setTimeout(() => {
      setLastFeedback(null);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [lastFeedback]);

  return {
    employees,
    timeline: state.timeline,
    pointer: state.pointer,
    canUndo,
    canRedo,
    undoLabel,
    redoLabel,
    lastFeedback,
    commitChange,
    undo,
    redo,
    jumpTo,
    dismissFeedback,
  };
}
