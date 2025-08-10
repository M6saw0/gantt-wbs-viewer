import { create } from 'zustand';
export const useDataStore = create((set, get) => ({
    // Initial state
    projects: [],
    tasks: [],
    holidays: [],
    graph: null,
    cpmResult: null,
    displayData: null,
    errors: [],
    isLoading: false,
    loadError: null,
    // Actions
    setProjects: (projects) => set({ projects }),
    setTasks: (tasks) => set({ tasks }),
    setHolidays: (holidays) => set({ holidays }),
    setGraph: (graph) => set({ graph }),
    setCpmResult: (cpmResult) => set({ cpmResult }),
    setDisplayData: (displayData) => set({ displayData }),
    setErrors: (errors) => set({ errors }),
    setLoading: (isLoading) => set({ isLoading }),
    setLoadError: (loadError) => set({ loadError }),
    clearData: () => set({
        projects: [],
        tasks: [],
        holidays: [],
        graph: null,
        cpmResult: null,
        displayData: null,
        errors: [],
        loadError: null
    }),
    // Getters
    getTaskById: (taskId) => {
        return get().tasks.find(t => t.taskId === taskId);
    },
    getTasksByGroup: (class1) => {
        const tasks = get().tasks;
        if (!class1) {
            return tasks.filter(t => !t.class1);
        }
        return tasks.filter(t => t.class1 === class1);
    },
    getGroups: () => {
        const tasks = get().tasks;
        const groups = new Set();
        for (const task of tasks) {
            if (task.class1) {
                groups.add(task.class1);
            }
        }
        return Array.from(groups).sort();
    }
}));
