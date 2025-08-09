import { create } from 'zustand';

interface UiStore {
  // Selection and hover
  selectedTaskId: number | null;
  hoveredTaskId: number | null;
  
  // Modal states
  showTaskCard: boolean;
  taskCardId: number | null;
  
  // Scroll positions
  ganttScrollX: number;
  ganttScrollY: number;
  
  // Toast notifications
  toasts: Toast[];
  
  // Actions
  selectTask: (taskId: number | null) => void;
  hoverTask: (taskId: number | null) => void;
  openTaskCard: (taskId: number) => void;
  closeTaskCard: () => void;
  setGanttScroll: (x: number, y: number) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

let toastId = 0;

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  selectedTaskId: null,
  hoveredTaskId: null,
  showTaskCard: false,
  taskCardId: null,
  ganttScrollX: 0,
  ganttScrollY: 0,
  toasts: [],
  
  // Actions
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  
  hoverTask: (taskId) => set({ hoveredTaskId: taskId }),
  
  openTaskCard: (taskId) => set({
    showTaskCard: true,
    taskCardId: taskId,
    selectedTaskId: taskId
  }),
  
  closeTaskCard: () => set({
    showTaskCard: false,
    taskCardId: null
  }),
  
  setGanttScroll: (x, y) => set({
    ganttScrollX: x,
    ganttScrollY: y
  }),
  
  showToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = { ...toast, id };
    
    set(state => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }, toast.duration || 5000);
    }
  },
  
  dismissToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  clearToasts: () => set({ toasts: [] })
}));
