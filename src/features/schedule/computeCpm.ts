import { Task } from '../../models/types';
import { DependencyGraph } from './buildGraph';
import { addDays, diffDays, getToday } from '../../utils/date';

export interface CpmResult {
  tasks: Task[];
  criticalTasks: Set<number>;
  criticalEdges: Set<string>; // "from-to" format
  projectStart: Date;
  projectFinish: Date;
}

export function computeCpm(graph: DependencyGraph): CpmResult {
  const { tasks, adjacencyList, reverseAdjacencyList, topologicalOrder } = graph;
  
  if (topologicalOrder.length === 0) {
    throw new Error('Circular dependency detected - cannot compute CPM');
  }
  
  // Initialize dates for tasks without dates
  const today = getToday();
  for (const task of tasks.values()) {
    if (!task.start && !task.finish) {
      task.start = today;
      if (task.effortDays) {
        task.finish = addDays(today, task.effortDays - 1);
      } else {
        task.finish = today;
      }
    } else if (task.start && !task.finish) {
      if (task.effortDays) {
        task.finish = addDays(task.start, task.effortDays - 1);
      } else {
        task.finish = task.start;
      }
    } else if (!task.start && task.finish) {
      if (task.effortDays) {
        task.start = addDays(task.finish, -(task.effortDays - 1));
      } else {
        task.start = task.finish;
      }
    }
  }
  
  // Forward pass - calculate early start and early finish
  for (const taskId of topologicalOrder) {
    const task = tasks.get(taskId)!;
    const predecessors = reverseAdjacencyList.get(taskId) || [];
    
    if (predecessors.length === 0) {
      // No predecessors - use actual start date
      task.earlyStart = task.start!;
      task.earlyFinish = task.finish!;
    } else {
      // Has predecessors - start after all predecessors finish
      let maxPredFinish = new Date(0);
      for (const predId of predecessors) {
        const pred = tasks.get(predId)!;
        if (pred.earlyFinish && pred.earlyFinish > maxPredFinish) {
          maxPredFinish = pred.earlyFinish;
        }
      }
      
      // Start the next day after predecessor finishes
      task.earlyStart = addDays(maxPredFinish, 1);
      const duration = task.finish && task.start ? diffDays(task.start, task.finish) : 0;
      task.earlyFinish = addDays(task.earlyStart, duration);
    }
  }
  
  // Find project finish date
  let projectFinish = new Date(0);
  for (const task of tasks.values()) {
    if (task.earlyFinish && task.earlyFinish > projectFinish) {
      projectFinish = task.earlyFinish;
    }
  }
  
  // Backward pass - calculate late start and late finish
  const reverseOrder = [...topologicalOrder].reverse();
  for (const taskId of reverseOrder) {
    const task = tasks.get(taskId)!;
    const successors = adjacencyList.get(taskId) || [];
    
    if (successors.length === 0) {
      // No successors - can finish as late as project finish
      task.lateFinish = projectFinish;
      const duration = task.finish && task.start ? diffDays(task.start, task.finish) : 0;
      task.lateStart = addDays(task.lateFinish, -duration);
    } else {
      // Has successors - must finish before earliest successor starts
      let minSuccStart = new Date(9999, 11, 31);
      for (const succId of successors) {
        const succ = tasks.get(succId)!;
        if (succ.lateStart && succ.lateStart < minSuccStart) {
          minSuccStart = succ.lateStart;
        }
      }
      
      // Must finish the day before successor starts
      task.lateFinish = addDays(minSuccStart, -1);
      const duration = task.finish && task.start ? diffDays(task.start, task.finish) : 0;
      task.lateStart = addDays(task.lateFinish, -duration);
    }
  }
  
  // Calculate total float and identify critical tasks
  const criticalTasks = new Set<number>();
  for (const task of tasks.values()) {
    if (task.earlyStart && task.lateStart) {
      task.totalFloat = diffDays(task.earlyStart, task.lateStart);
      if (task.totalFloat <= 0) {
        task.isCritical = true;
        criticalTasks.add(task.taskId);
      } else {
        task.isCritical = false;
      }
    }
  }
  
  // Identify critical edges
  const criticalEdges = new Set<string>();
  for (const edge of graph.edges) {
    const fromTask = tasks.get(edge.from)!;
    const toTask = tasks.get(edge.to)!;
    
    if (fromTask.isCritical && toTask.isCritical) {
      // Check if the edge is actually on the critical path
      // (successor's early start should be right after predecessor's early finish)
      if (fromTask.earlyFinish && toTask.earlyStart) {
        const expectedStart = addDays(fromTask.earlyFinish, 1);
        if (expectedStart.getTime() === toTask.earlyStart.getTime()) {
          criticalEdges.add(`${edge.from}-${edge.to}`);
          edge.isCritical = true;
        }
      }
    }
  }
  
  // Find project start date
  let projectStart = new Date(9999, 11, 31);
  for (const task of tasks.values()) {
    if (task.earlyStart && task.earlyStart < projectStart) {
      projectStart = task.earlyStart;
    }
  }
  
  return {
    tasks: Array.from(tasks.values()),
    criticalTasks,
    criticalEdges,
    projectStart,
    projectFinish
  };
}
