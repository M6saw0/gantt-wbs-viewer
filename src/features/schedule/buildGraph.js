export function buildGraph(tasks) {
    const taskMap = new Map();
    const edges = [];
    const adjacencyList = new Map();
    const reverseAdjacencyList = new Map();
    // Build task map
    for (const task of tasks) {
        taskMap.set(task.taskId, task);
        adjacencyList.set(task.taskId, []);
        reverseAdjacencyList.set(task.taskId, []);
    }
    // Build adjacency lists and edges
    for (const task of tasks) {
        for (const predId of task.predecessorIds) {
            if (taskMap.has(predId)) {
                // Add edge from predecessor to task
                edges.push({ from: predId, to: task.taskId });
                // Update adjacency lists
                const successors = adjacencyList.get(predId) || [];
                successors.push(task.taskId);
                adjacencyList.set(predId, successors);
                const predecessors = reverseAdjacencyList.get(task.taskId) || [];
                predecessors.push(predId);
                reverseAdjacencyList.set(task.taskId, predecessors);
            }
        }
    }
    // Calculate topological order
    const topologicalOrder = calculateTopologicalOrder(taskMap, reverseAdjacencyList);
    return {
        tasks: taskMap,
        edges,
        adjacencyList,
        reverseAdjacencyList,
        topologicalOrder
    };
}
function calculateTopologicalOrder(tasks, reverseAdjacencyList) {
    const order = [];
    const visited = new Set();
    const tempVisited = new Set();
    function visit(taskId) {
        if (tempVisited.has(taskId)) {
            // Cycle detected
            return false;
        }
        if (visited.has(taskId)) {
            return true;
        }
        tempVisited.add(taskId);
        const predecessors = reverseAdjacencyList.get(taskId) || [];
        for (const predId of predecessors) {
            if (!visit(predId)) {
                return false;
            }
        }
        tempVisited.delete(taskId);
        visited.add(taskId);
        order.push(taskId);
        return true;
    }
    // Visit all tasks
    for (const taskId of tasks.keys()) {
        if (!visited.has(taskId)) {
            if (!visit(taskId)) {
                // Cycle detected, return empty order
                return [];
            }
        }
    }
    return order;
}
