import { create } from 'zustand';
import { Project, Task, Holiday, DependencyEdge, ValidationError } from '../models/types';
import { DependencyGraph } from '../features/schedule/buildGraph';
import { CpmResult } from '../features/schedule/computeCpm';
import { DisplayData } from '../features/schedule/deriveDisplayData';

interface DataStore {
  // Raw data
  projects: Project[];
  tasks: Task[];
  holidays: Holiday[];
  
  // Computed data
  graph: DependencyGraph | null;
  cpmResult: CpmResult | null;
  displayData: DisplayData | null;
  
  // Validation
  errors: ValidationError[];
  
  // Loading state
  isLoading: boolean;
  loadError: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setHolidays: (holidays: Holiday[]) => void;
  setGraph: (graph: DependencyGraph) => void;
  setCpmResult: (result: CpmResult) => void;
  setDisplayData: (data: DisplayData) => void;
  setErrors: (errors: ValidationError[]) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadError: (error: string | null) => void;
  clearData: () => void;
  
  // Getters
  getTaskById: (taskId: number) => Task | undefined;
  getTasksByGroup: (class1?: string) => Task[];
  getGroups: () => string[];
}

export const useDataStore = create<DataStore>((set, get) => ({
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
  getTaskById: (taskId: number) => {
    return get().tasks.find(t => t.taskId === taskId);
  },
  
  getTasksByGroup: (class1?: string) => {
    const tasks = get().tasks;
    if (!class1) {
      return tasks.filter(t => !t.class1);
    }
    return tasks.filter(t => t.class1 === class1);
  },
  
  getGroups: () => {
    const tasks = get().tasks;
    const groups = new Set<string>();
    
    for (const task of tasks) {
      if (task.class1) {
        groups.add(task.class1);
      }
    }
    
    return Array.from(groups).sort();
  }
}));
