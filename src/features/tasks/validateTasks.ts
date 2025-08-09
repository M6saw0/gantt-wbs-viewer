import { Task, ValidationError } from '../../models/types';

export function validateTasks(tasks: Task[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check for duplicate IDs
  const idSet = new Set<number>();
  const duplicateIds = new Set<number>();
  
  for (const task of tasks) {
    if (idSet.has(task.taskId)) {
      duplicateIds.add(task.taskId);
    }
    idSet.add(task.taskId);
  }
  
  if (duplicateIds.size > 0) {
    errors.push({
      type: 'duplicate_id',
      message: `重複したIDが見つかりました: ${Array.from(duplicateIds).join(', ')}`,
      details: { duplicateIds: Array.from(duplicateIds) }
    });
  }
  
  // Check for invalid predecessor references
  const invalidRefs: { taskId: number; invalidPredecessors: number[] }[] = [];
  
  for (const task of tasks) {
    const invalid = task.predecessorIds.filter(id => !idSet.has(id));
    if (invalid.length > 0) {
      invalidRefs.push({
        taskId: task.taskId,
        invalidPredecessors: invalid
      });
    }
  }
  
  if (invalidRefs.length > 0) {
    const details = invalidRefs.map(ref => 
      `タスク ${ref.taskId}: 前工程 ${ref.invalidPredecessors.join(', ')} が存在しません`
    ).join('\n');
    
    errors.push({
      type: 'invalid_reference',
      message: '存在しない前工程への参照が見つかりました',
      details: { invalidRefs, message: details }
    });
  }
  
  // Check for circular dependencies
  const circularDeps = detectCircularDependencies(tasks);
  if (circularDeps.length > 0) {
    errors.push({
      type: 'circular_dependency',
      message: '循環依存が検出されました',
      details: { cycles: circularDeps }
    });
  }
  
  return errors;
}

function detectCircularDependencies(tasks: Task[]): number[][] {
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  const cycles: number[][] = [];
  const visited = new Set<number>();
  const recursionStack = new Set<number>();
  const path: number[] = [];
  
  function dfs(taskId: number): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);
    
    const task = taskMap.get(taskId);
    if (!task) {
      path.pop();
      recursionStack.delete(taskId);
      return false;
    }
    
    for (const predId of task.predecessorIds) {
      if (!visited.has(predId)) {
        if (dfs(predId)) {
          return true;
        }
      } else if (recursionStack.has(predId)) {
        // Found a cycle
        const cycleStart = path.indexOf(predId);
        const cycle = path.slice(cycleStart);
        cycle.push(predId); // Close the cycle
        cycles.push(cycle);
        return true;
      }
    }
    
    path.pop();
    recursionStack.delete(taskId);
    return false;
  }
  
  for (const task of tasks) {
    if (!visited.has(task.taskId)) {
      path.length = 0;
      dfs(task.taskId);
    }
  }
  
  return cycles;
}
