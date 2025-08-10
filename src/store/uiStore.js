import { create } from 'zustand';
let toastId = 0;
export const useUiStore = create((set) => ({
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
        const newToast = { ...toast, id };
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
